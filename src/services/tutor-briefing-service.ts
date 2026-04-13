/**
 * Tutor Briefing Service with AI Struggle Analysis
 *
 * Purpose: Generate comprehensive briefings for tutors before sessions,
 * powered by AI analysis of student struggle patterns, progress, and learning needs.
 *
 * Features:
 * - AI-analyzed struggle patterns
 * - Topic mastery heatmap
 * - Recommended session focus areas
 * - Suggested teaching approaches
 * - Progress since last session
 * - Red flags and intervention alerts
 */

import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { dbManager } from '@/lib/db';
import {
	conceptStruggles,
	questionAttempts,
	quizResults,
	studySessions,
	topicMastery,
	tutoringSessions,
	userProgress,
	users,
	wellnessCheckIns,
} from '@/lib/db/schema';

// ========================
// TYPES
// ========================

export interface TutorBriefing {
	studentProfile: StudentProfile;
	sessionContext: SessionContext;
	struggleAnalysis: StruggleAnalysis;
	progressReport: ProgressReport;
	sessionPlan: SessionPlan;
	redFlags: RedFlag[];
	teachingTips: TeachingTip[];
}

export interface StudentProfile {
	id: string;
	name: string;
	grade: string;
	subjects: string[];
	learningStyle?: string;
	wellbeingStatus: 'good' | 'concerning' | 'critical';
	lastActive: Date;
}

export interface SessionContext {
	sessionId: string;
	tutorId: string;
	studentId: string;
	scheduledAt: Date;
	subject: string;
	topic?: string;
	sessionType: 'first' | 'follow_up' | 'exam_prep' | 'catch_up';
	previousSessionSummary?: string;
}

export interface StruggleAnalysis {
	topStruggleTopics: StruggleTopic[];
	commonMistakes: CommonMistake[];
	knowledgeGaps: KnowledgeGap[];
	learningBarriers: string[];
}

export interface StruggleTopic {
	subject: string;
	topic: string;
	masteryLevel: number;
	struggleScore: number; // 0-1, higher = more struggle
	lastAttempted: Date;
	attemptCount: number;
	successRate: number;
}

export interface CommonMistake {
	topic: string;
	mistakeDescription: string;
	frequency: number;
	correctApproach: string;
}

export interface KnowledgeGap {
	prerequisite: string;
	gapDescription: string;
	impactOnCurrentLearning: string;
	recommendedRemediation: string;
}

export interface ProgressReport {
	improvementSinceLastSession: boolean;
	topicsImproved: string[];
	topicsDeclined: string[];
	quizPerformanceTrend: 'improving' | 'stable' | 'declining';
	streakDays: number;
	totalStudyHours: number;
}

export interface SessionPlan {
	recommendedFocus: string[];
	suggestedActivities: string[];
	estimatedTimePerActivity: Record<string, number>;
	difficultyLevel: 'review' | 'build' | 'advance';
	keyConceptsToCover: string[];
	practiceQuestions: string[];
}

export interface RedFlag {
	type: 'academic' | 'wellbeing' | 'engagement' | 'attendance';
	severity: 'low' | 'medium' | 'high' | 'critical';
	description: string;
	recommendedAction: string;
}

export interface TeachingTip {
	topic: string;
	approach: string;
	commonPitfall: string;
	successStrategy: string;
}

// ========================
// MAIN BRIEFING GENERATION
// ========================

/**
 * Generate comprehensive tutor briefing
 */
export async function generateTutorBriefing(sessionId: string): Promise<TutorBriefing> {
	const db = await dbManager.getDb();

	// Get session details
	const session = await db
		.select()
		.from(tutoringSessions)
		.where(eq(tutoringSessions.id, sessionId))
		.limit(1);

	if (session.length === 0) {
		throw new Error('Session not found');
	}

	const sessionData = session[0];

	// Gather all data in parallel
	const [studentProfile, struggleAnalysis, progressReport] = await Promise.all([
		getStudentProfile(sessionData.studentId),
		analyzeStudentStruggles(sessionData.studentId, sessionData.subjectId),
		generateProgressReport(sessionData.studentId, sessionId),
	]);

	// Generate AI-powered session plan
	const sessionPlan = await generateSessionPlan(
		studentProfile,
		struggleAnalysis,
		progressReport,
		sessionData.subjectId,
		sessionData.topic
	);

	// Detect red flags
	const redFlags = detectRedFlags(studentProfile, struggleAnalysis, progressReport);

	// Generate teaching tips
	const teachingTips = await generateTeachingTips(
		struggleAnalysis,
		sessionData.subjectId,
		sessionData.topic
	);

	return {
		studentProfile,
		sessionContext: {
			sessionId: sessionData.id,
			tutorId: sessionData.tutorId,
			studentId: sessionData.studentId,
			scheduledAt: new Date(sessionData.scheduledAt),
			subject: sessionData.subjectId,
			topic: sessionData.topic,
			sessionType: determineSessionType(sessionData, progressReport),
		},
		struggleAnalysis,
		progressReport,
		sessionPlan,
		redFlags,
		teachingTips,
	};
}

// ========================
// STUDENT PROFILE
// ========================

async function getStudentProfile(userId: string): Promise<StudentProfile> {
	const db = await dbManager.getDb();

	const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

	if (!user) {
		throw new Error('Student not found');
	}

	// Get subjects from progress data
	const progressData = await db
		.select({ subjectId: userProgress.subjectId })
		.from(userProgress)
		.where(eq(userProgress.userId, userId))
		.limit(10);

	const subjects = [...new Set(progressData.map((p) => p.subjectId))];

	// Check wellness status
	const recentWellness = await db
		.select()
		.from(wellnessCheckIns)
		.where(eq(wellnessCheckIns.userId, userId))
		.orderBy(desc(wellnessCheckIns.checkedInAt))
		.limit(1);

	let wellbeingStatus: 'good' | 'concerning' | 'critical' = 'good';
	if (recentWellness.length > 0) {
		const mood = Number(recentWellness[0].mood);
		const stress = Number(recentWellness[0].stressLevel);
		if (mood <= 2 || stress >= 8) {
			wellbeingStatus = 'critical';
		} else if (mood <= 3 || stress >= 6) {
			wellbeingStatus = 'concerning';
		}
	}

	return {
		id: user.id,
		name: user.name,
		grade: 'Grade 12',
		subjects,
		wellbeingStatus,
		lastActive: new Date(user.updatedAt),
	};
}

// ========================
// STRUGGLE ANALYSIS
// ========================

async function analyzeStudentStruggles(userId: string, subject: string): Promise<StruggleAnalysis> {
	const db = await dbManager.getDb();

	// Get topic mastery for subject
	const masteryData = await db
		.select()
		.from(topicMastery)
		.where(and(eq(topicMastery.userId, userId), eq(topicMastery.subjectId, subject)))
		.orderBy(sql`${topicMastery.masteryLevel} ASC`)
		.limit(10);

	// Get concept struggles
	const struggles = await db
		.select()
		.from(conceptStruggles)
		.where(eq(conceptStruggles.userId, userId))
		.orderBy(desc(conceptStruggles.occurrenceCount))
		.limit(10);

	// Get recent question attempts to find patterns
	const recentAttempts = await db
		.select({
			questionId: questionAttempts.questionId,
			topic: questionAttempts.topic,
			isCorrect: questionAttempts.isCorrect,
			attemptedAt: questionAttempts.attemptedAt,
		})
		.from(questionAttempts)
		.where(and(eq(questionAttempts.userId, userId), eq(questionAttempts.subjectId, subject)))
		.orderBy(desc(questionAttempts.attemptedAt))
		.limit(50);

	// Analyze wrong answers for patterns
	const wrongAnswers = recentAttempts.filter((a) => !a.isCorrect);
	const topicWrongCount = new Map<string, number>();
	const topicTotalCount = new Map<string, number>();

	for (const attempt of wrongAnswers) {
		const topic = attempt.topic || 'general';
		topicWrongCount.set(topic, (topicWrongCount.get(topic) || 0) + 1);
	}

	for (const attempt of recentAttempts) {
		const topic = attempt.topic || 'general';
		topicTotalCount.set(topic, (topicTotalCount.get(topic) || 0) + 1);
	}

	// Build struggle topics
	const topStruggleTopics: StruggleTopic[] = masteryData.slice(0, 5).map((m) => {
		const topic = m.topic;
		const wrongCount = topicWrongCount.get(topic) || 0;
		const totalCount = topicTotalCount.get(topic) || 1;
		const successRate = 1 - wrongCount / totalCount;

		return {
			subject: m.subjectId,
			topic: m.topic,
			masteryLevel: Number(m.masteryLevel),
			struggleScore: 1 - Number(m.masteryLevel),
			lastAttempted: m.lastPracticed || new Date(0),
			attemptCount: totalCount,
			successRate,
		};
	});

	// Generate AI analysis of common mistakes
	const commonMistakes = await analyzeCommonMistakesWithAI(topStruggleTopics, subject);

	// Identify knowledge gaps
	const knowledgeGaps = await identifyKnowledgeGapsWithAI(topStruggleTopics, subject);

	// Identify learning barriers
	const learningBarriers = identifyLearningBarriers(topStruggleTopics, struggles);

	return {
		topStruggleTopics,
		commonMistakes,
		knowledgeGaps,
		learningBarriers,
	};
}

// ========================
// PROGRESS REPORT
// ========================

async function generateProgressReport(userId: string, sessionId: string): Promise<ProgressReport> {
	const db = await dbManager.getDb();

	// Get previous session date
	const [currentSession] = await db
		.select({ scheduledAt: tutoringSessions.scheduledAt })
		.from(tutoringSessions)
		.where(eq(tutoringSessions.id, sessionId))
		.limit(1);

	if (!currentSession) {
		throw new Error('Session not found');
	}

	// Get quiz performance before and after previous sessions
	const previousSessions = await db
		.select({ scheduledAt: tutoringSessions.scheduledAt })
		.from(tutoringSessions)
		.where(
			and(
				eq(tutoringSessions.studentId, userId),
				lt(tutoringSessions.scheduledAt, currentSession.scheduledAt)
			)
		)
		.orderBy(desc(tutoringSessions.scheduledAt))
		.limit(1);

	const comparisonDate =
		previousSessions.length > 0
			? new Date(previousSessions[0].scheduledAt)
			: new Date(currentSession.scheduledAt.getTime() - 7 * 24 * 60 * 60 * 1000);

	const recentQuizzes = await db
		.select()
		.from(quizResults)
		.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, comparisonDate)));

	const olderQuizzes = await db
		.select()
		.from(quizResults)
		.where(
			and(
				eq(quizResults.userId, userId),
				gte(quizResults.completedAt, new Date(comparisonDate.getTime() - 7 * 24 * 60 * 60 * 1000)),
				sql`${quizResults.completedAt} < ${comparisonDate}`
			)
		);

	const recentAvg =
		recentQuizzes.length > 0
			? recentQuizzes.reduce((sum, q) => sum + Number(q.percentage), 0) / recentQuizzes.length
			: 0;

	const olderAvg =
		olderQuizzes.length > 0
			? olderQuizzes.reduce((sum, q) => sum + Number(q.percentage), 0) / olderQuizzes.length
			: 0;

	const improvementSinceLastSession = recentAvg > olderAvg;

	// Get study hours
	const studySessionsData = await db
		.select({ duration: studySessions.duration })
		.from(studySessions)
		.where(eq(studySessions.userId, userId));

	const totalStudyHours = studySessionsData.reduce((sum, s) => sum + Number(s.duration), 0) / 60; // Convert minutes to hours

	// Get streak
	const [progress] = await db
		.select({ streakDays: userProgress.streakDays })
		.from(userProgress)
		.where(eq(userProgress.userId, userId))
		.limit(1);

	const quizPerformanceTrend =
		recentAvg > olderAvg + 5 ? 'improving' : recentAvg < olderAvg - 5 ? 'declining' : 'stable';

	return {
		improvementSinceLastSession,
		topicsImproved: [], // TODO: Track specific topics
		topicsDeclined: [],
		quizPerformanceTrend,
		streakDays: Number(progress?.streakDays) || 0,
		totalStudyHours: Math.round(totalStudyHours * 10) / 10,
	};
}

// ========================
// SESSION PLAN GENERATION
// ========================

async function generateSessionPlan(
	_student: StudentProfile,
	struggles: StruggleAnalysis,
	progress: ProgressReport,
	subject: string,
	topic?: string
): Promise<SessionPlan> {
	const struggleTopics = struggles.topStruggleTopics
		.map((t) => `- ${t.topic} (mastery: ${Math.round(t.masteryLevel * 100)}%)`)
		.join('\n');

	const prompt = `You are an expert education consultant preparing a tutoring session plan for a Grade 12 South African student.

Student Context:
- Subject: ${subject}
${topic ? `- Topic Focus: ${topic}` : ''}
- Current streak: ${progress.streakDays} days
- Total study hours: ${progress.totalStudyHours}
- Performance trend: ${progress.quizPerformanceTrend}

Top Struggle Areas:
${struggleTopics}

Create a focused 60-minute session plan that:
1. Addresses the student's weakest areas
2. Builds confidence through achievable wins
3. Includes practice and explanation time

Provide the response as JSON with this structure:
{
  "recommendedFocus": ["topic1", "topic2"],
  "suggestedActivities": ["activity1", "activity2"],
  "estimatedTimePerActivity": {"activity1": 15, "activity2": 20},
  "difficultyLevel": "review|build|advance",
  "keyConceptsToCover": ["concept1", "concept2"],
  "practiceQuestions": ["question prompt 1", "question prompt 2"]
}

Respond with valid JSON only.`;

	try {
		const response = await generateAI({
			prompt,
			model: AI_MODELS.PRIMARY,
		});

		// Extract JSON from response
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]) as SessionPlan;
		}

		throw new Error('Failed to parse AI response');
	} catch (error) {
		console.error('Failed to generate session plan:', error);

		// Fallback plan
		return {
			recommendedFocus: struggles.topStruggleTopics.slice(0, 3).map((t) => t.topic),
			suggestedActivities: [
				'Review key concepts',
				'Guided practice with examples',
				'Independent practice questions',
			],
			estimatedTimePerActivity: {
				'Review key concepts': 15,
				'Guided practice with examples': 20,
				'Independent practice questions': 25,
			},
			difficultyLevel: 'review',
			keyConceptsToCover: struggles.topStruggleTopics.slice(0, 3).map((t) => t.topic),
			practiceQuestions: [
				`Practice problem on ${struggles.topStruggleTopics[0]?.topic || 'core concept'}`,
			],
		};
	}
}

// ========================
// RED FLAG DETECTION
// ========================

function detectRedFlags(
	student: StudentProfile,
	struggles: StruggleAnalysis,
	progress: ProgressReport
): RedFlag[] {
	const flags: RedFlag[] = [];

	// Wellbeing red flags
	if (student.wellbeingStatus === 'critical') {
		flags.push({
			type: 'wellbeing',
			severity: 'critical',
			description: 'Student wellbeing is concerning - check in gently',
			recommendedAction:
				'Start session with wellbeing check. Ask how they are feeling and if there is anything you can do to support them.',
		});
	}

	// Academic red flags
	if (struggles.topStruggleTopics.some((t) => t.masteryLevel < 0.2)) {
		const criticalTopic = struggles.topStruggleTopics.find((t) => t.masteryLevel < 0.2)!;
		flags.push({
			type: 'academic',
			severity: 'high',
			description: `Critical mastery gap: ${criticalTopic.topic} (${Math.round(criticalTopic.masteryLevel * 100)}%)`,
			recommendedAction: `Focus session foundation on ${criticalTopic.topic}. Start with basic concepts before attempting problems.`,
		});
	}

	// Engagement red flags
	if (progress.streakDays === 0) {
		flags.push({
			type: 'engagement',
			severity: 'medium',
			description: 'Student has lost their study streak',
			recommendedAction:
				'Encourage student to restart streak. Celebrate small wins to rebuild momentum.',
		});
	}

	// Performance decline
	if (progress.quizPerformanceTrend === 'declining') {
		flags.push({
			type: 'academic',
			severity: 'medium',
			description: 'Quiz performance is declining',
			recommendedAction:
				'Review whether the pace is too fast. Consider spending more time on fundamentals.',
		});
	}

	// Low study hours
	if (progress.totalStudyHours < 5) {
		flags.push({
			type: 'engagement',
			severity: 'low',
			description: 'Low total study time',
			recommendedAction:
				'Discuss study habits. Help student create a realistic weekly study schedule.',
		});
	}

	return flags;
}

// ========================
// TEACHING TIPS GENERATION
// ========================

async function generateTeachingTips(
	struggles: StruggleAnalysis,
	subject: string,
	topic?: string
): Promise<TeachingTip[]> {
	const topTopic = struggles.topStruggleTopics[0];
	if (!topTopic) {
		return [];
	}

	const prompt = `You are an experienced Grade 12 teacher in South Africa.

Subject: ${subject}
${topic ? `Topic: ${topic}` : `Focus Topic: ${topTopic.topic}`}

Provide 3 teaching tips for helping a student who is struggling with this topic.

For each tip, provide:
1. The topic it applies to
2. The recommended teaching approach
3. A common pitfall to avoid
4. A strategy that has worked for other students

Respond as JSON array:
[
  {
    "topic": "topic name",
    "approach": "teaching approach",
    "commonPitfall": "what to avoid",
    "successStrategy": "what works"
  }
]

Respond with valid JSON only.`;

	try {
		const response = await generateAI({
			prompt,
			model: AI_MODELS.PRIMARY,
		});

		const jsonMatch = response.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]) as TeachingTip[];
		}

		throw new Error('Failed to parse AI response');
	} catch (error) {
		console.error('Failed to generate teaching tips:', error);

		return [
			{
				topic: topTopic.topic,
				approach: 'Start with concrete examples before abstract concepts',
				commonPitfall: 'Rushing into complex problems without ensuring foundational understanding',
				successStrategy: 'Use real-world examples relevant to South African context',
			},
			{
				topic: topTopic.topic,
				approach: 'Have student explain their thinking process out loud',
				commonPitfall: 'Assuming silence means understanding',
				successStrategy: 'Ask "why" questions to probe depth of understanding',
			},
			{
				topic: topTopic.topic,
				approach: 'Break problems into smaller, manageable steps',
				commonPitfall: 'Overwhelming student with the full problem at once',
				successStrategy: 'Celebrate progress on each step to build confidence',
			},
		];
	}
}

// ========================
// AI ANALYSIS HELPERS
// ========================

async function analyzeCommonMistakesWithAI(
	struggleTopics: StruggleTopic[],
	subject: string
): Promise<CommonMistake[]> {
	if (struggleTopics.length === 0) return [];

	const topicList = struggleTopics.map((t) => t.topic).join(', ');

	const prompt = `What are the 3 most common mistakes Grade 12 students make when learning these ${subject} topics: ${topicList}?

For each mistake provide:
- topic: which topic it relates to
- mistakeDescription: what students typically get wrong
- frequency: how common it is (1-10)
- correctApproach: what students should do instead

Respond as JSON array.`;

	try {
		const response = await generateAI({ prompt, model: AI_MODELS.PRIMARY });
		const jsonMatch = response.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]) as CommonMistake[];
		}
	} catch (error) {
		console.error('Failed to analyze common mistakes:', error);
	}

	return struggleTopics.slice(0, 3).map((t) => ({
		topic: t.topic,
		mistakeDescription: 'Common conceptual errors in this topic',
		frequency: 5,
		correctApproach: 'Review fundamentals and practice with guidance',
	}));
}

async function identifyKnowledgeGapsWithAI(
	struggleTopics: StruggleTopic[],
	subject: string
): Promise<KnowledgeGap[]> {
	if (struggleTopics.length === 0) return [];

	const topicList = struggleTopics.map((t) => t.topic).join(', ');

	const prompt = `What prerequisite knowledge gaps might be causing struggles with these ${subject} topics: ${topicList}?

Identify up to 3 gaps. For each:
- prerequisite: what foundational concept is missing
- gapDescription: what students are missing
- impactOnCurrentLearning: how this gap affects current learning
- recommendedRemediation: how to fill the gap

Respond as JSON array.`;

	try {
		const response = await generateAI({ prompt, model: AI_MODELS.PRIMARY });
		const jsonMatch = response.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]) as KnowledgeGap[];
		}
	} catch (error) {
		console.error('Failed to identify knowledge gaps:', error);
	}

	return [];
}

function identifyLearningBarriers(
	struggleTopics: StruggleTopic[],
	struggles: Array<{ concept: string; occurrenceCount: number }>
): string[] {
	const barriers: string[] = [];

	if (struggleTopics.some((t) => t.successRate < 0.3)) {
		barriers.push('Low success rate causing frustration');
	}

	if (struggleTopics.some((t) => t.attemptCount > 10 && t.successRate < 0.5)) {
		barriers.push('Repeated attempts without improvement - may need different teaching approach');
	}

	if (struggles.length > 5) {
		barriers.push('Multiple struggle areas detected - consider foundational review');
	}

	if (barriers.length === 0) {
		barriers.push('No significant barriers detected');
	}

	return barriers;
}

function determineSessionType(
	_sessionData: { scheduledAt: Date },
	progress: ProgressReport
): 'first' | 'follow_up' | 'exam_prep' | 'catch_up' {
	if (!progress.improvementSinceLastSession) {
		return 'catch_up';
	}
	return 'follow_up';
}
