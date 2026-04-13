/**
 * AI Study Plan Quiz Feedback Loop
 *
 * Purpose: Create a closed learning loop where:
 * 1. AI Tutor identifies knowledge gaps
 * 2. Study Plan is auto-generated/updated
 * 3. Targeted quizzes are assigned
 * 4. Quiz results feed back into AI Tutor
 * 5. Study Plan is adjusted based on performance
 *
 * This creates a continuous improvement cycle personalized to each student.
 */

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { quizResults, studyPlans, topicMastery } from '@/lib/db/schema';
import { generateStudyPlan } from '@/services/geminiService';

// ========================
// TYPES
// ========================

export interface LearningLoopState {
	userId: string;
	currentStudyPlan: StudyPlanSummary | null;
	recentQuizPerformance: QuizPerformanceSummary[];
	weakTopics: WeakTopic[];
	recommendations: LearningRecommendation[];
}

export interface StudyPlanSummary {
	id: string;
	title: string;
	topics: string[];
	createdAt: Date;
	completionPercentage: number;
}

export interface QuizPerformanceSummary {
	subject: string;
	topic: string;
	accuracy: number;
	quizCount: number;
	lastAttempt: Date;
}

export interface WeakTopic {
	subject: string;
	topic: string;
	masteryLevel: number; // 0-1
	lastPracticed: Date | null;
	recommendedAction: string;
}

export interface LearningRecommendation {
	type: 'study' | 'practice' | 'review' | 'advance';
	subject: string;
	topic: string;
	priority: 'high' | 'medium' | 'low';
	reason: string;
	action: string;
}

export interface FeedbackLoopResult {
	studyPlanUpdated: boolean;
	newQuizAssigned: boolean;
	topicsImproved: string[];
	topicsDeclined: string[];
	nextSteps: string[];
}

// ========================
// MAIN LOOP EXECUTION
// ========================

/**
 * Execute the full AI→Study Plan→Quiz feedback loop
 * Should be triggered:
 * - After quiz completion
 * - Daily (automated)
 * - On user request
 */
export async function executeLearningLoop(userId: string): Promise<FeedbackLoopResult> {
	const _db = await dbManager.getDb();

	// Step 1: Gather current learning state
	const currentState = await getCurrentState(userId);

	// Step 2: Analyze performance trends
	const performanceTrends = await analyzePerformanceTrends(userId);

	// Step 3: Identify topics needing attention
	const topicsNeedingAttention = identifyTopicsNeedingAttention(currentState, performanceTrends);

	// Step 4: Update study plan based on analysis
	const studyPlanUpdateResult = await updateStudyPlan(userId, topicsNeedingAttention);

	// Step 5: Generate targeted quiz recommendations
	const quizRecommendations = await generateTargetedQuizzes(userId, topicsNeedingAttention);

	// Step 6: Update topic mastery predictions
	const _masteryUpdates = await updateTopicMasteryPredictions(userId, performanceTrends);

	// Step 7: Generate personalized recommendations
	const recommendations = generateRecommendations(
		currentState,
		performanceTrends,
		topicsNeedingAttention
	);

	return {
		studyPlanUpdated: studyPlanUpdateResult.success,
		newQuizAssigned: quizRecommendations.length > 0,
		topicsImproved: performanceTrends.improvedTopics.map((t) => t.topic),
		topicsDeclined: performanceTrends.declinedTopics.map((t) => t.topic),
		nextSteps: recommendations.slice(0, 3).map((r) => r.action),
	};
}

// ========================
// STATE GATHERING
// ========================

/**
 * Get current learning state for user
 */
export async function getCurrentState(userId: string): Promise<LearningLoopState> {
	const db = await dbManager.getDb();

	// Get current study plan
	const currentStudyPlan = await db
		.select()
		.from(studyPlans)
		.where(eq(studyPlans.userId, userId))
		.orderBy(desc(studyPlans.createdAt))
		.limit(1);

	// Get recent quiz performance (last 14 days)
	const fourteenDaysAgo = new Date();
	fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

	const recentQuizzes = await db
		.select()
		.from(quizResults)
		.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, fourteenDaysAgo)));

	// Aggregate by subject+topic
	const quizPerformanceMap = new Map<string, QuizPerformanceSummary>();

	for (const quiz of recentQuizzes) {
		const key = `${quiz.subjectId}::${quiz.topic || 'general'}`;
		const existing = quizPerformanceMap.get(key);

		if (existing) {
			existing.accuracy =
				(existing.accuracy * (existing.quizCount - 1) + Number(quiz.percentage)) /
				existing.quizCount;
			existing.quizCount++;
			if (new Date(quiz.completedAt) > existing.lastAttempt) {
				existing.lastAttempt = new Date(quiz.completedAt);
			}
		} else {
			quizPerformanceMap.set(key, {
				subject: quiz.subjectId,
				topic: quiz.topic || 'general',
				accuracy: Number(quiz.percentage),
				quizCount: 1,
				lastAttempt: new Date(quiz.completedAt),
			});
		}
	}

	// Get weak topics (mastery < 0.5)
	const weakTopicsData = await db
		.select()
		.from(topicMastery)
		.where(and(eq(topicMastery.userId, userId), sql`${topicMastery.masteryLevel} < 0.5`))
		.limit(10);

	const weakTopics: WeakTopic[] = weakTopicsData.map((wt) => ({
		subject: wt.subjectId,
		topic: wt.topic,
		masteryLevel: Number(wt.masteryLevel),
		lastPracticed: wt.lastPracticed,
		recommendedAction: getRecommendedAction(wt),
	}));

	// Generate recommendations
	const recommendations: LearningRecommendation[] = [];

	for (const weakTopic of weakTopics) {
		recommendations.push({
			type: 'practice',
			subject: weakTopic.subject,
			topic: weakTopic.topic,
			priority: weakTopic.masteryLevel < 0.3 ? 'high' : 'medium',
			reason: `Low mastery (${Math.round(weakTopic.masteryLevel * 100)}%)`,
			action: `Practice ${weakTopic.topic} in ${weakTopic.subject}`,
		});
	}

	return {
		userId,
		currentStudyPlan: currentStudyPlan[0]
			? {
					id: currentStudyPlan[0].id,
					title: currentStudyPlan[0].title,
					topics: [],
					createdAt: new Date(currentStudyPlan[0].createdAt),
					completionPercentage: 0,
				}
			: null,
		recentQuizPerformance: Array.from(quizPerformanceMap.values()),
		weakTopics,
		recommendations,
	};
}

// ========================
// PERFORMANCE ANALYSIS
// ========================

export interface PerformanceTrends {
	improvedTopics: Array<{ topic: string; subject: string; improvement: number }>;
	declinedTopics: Array<{ topic: string; subject: string; decline: number }>;
	stableTopics: Array<{ topic: string; subject: string; accuracy: number }>;
	overallTrend: 'improving' | 'declining' | 'stable';
}

/**
 * Analyze performance trends over time
 */
export async function analyzePerformanceTrends(userId: string): Promise<PerformanceTrends> {
	const db = await dbManager.getDb();

	// Compare last 7 days vs previous 7 days
	const now = new Date();
	const recentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

	const recentQuizzes = await db
		.select()
		.from(quizResults)
		.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, recentStart)));

	const previousQuizzes = await db
		.select()
		.from(quizResults)
		.where(
			and(
				eq(quizResults.userId, userId),
				gte(quizResults.completedAt, previousStart),
				sql`${quizResults.completedAt} < ${recentStart}`
			)
		);

	// Aggregate by topic
	const aggregateByTopic = (quizzes: typeof recentQuizzes) => {
		const map = new Map<string, { total: number; count: number }>();
		for (const quiz of quizzes) {
			const key = `${quiz.subjectId}::${quiz.topic || 'general'}`;
			const existing = map.get(key) || { total: 0, count: 0 };
			existing.total += Number(quiz.percentage);
			existing.count++;
			map.set(key, existing);
		}
		return map;
	};

	const recentAgg = aggregateByTopic(recentQuizzes);
	const previousAgg = aggregateByTopic(previousQuizzes);

	const improvedTopics: PerformanceTrends['improvedTopics'] = [];
	const declinedTopics: PerformanceTrends['declinedTopics'] = [];
	const stableTopics: PerformanceTrends['stableTopics'] = [];

	// Compare topics
	const allTopics = new Set([...recentAgg.keys(), ...previousAgg.keys()]);

	for (const topicKey of allTopics) {
		const recent = recentAgg.get(topicKey);
		const previous = previousAgg.get(topicKey);

		const [subject, topic] = topicKey.split('::');

		if (recent && previous) {
			const recentAvg = recent.total / recent.count;
			const previousAvg = previous.total / previous.count;
			const diff = recentAvg - previousAvg;

			if (diff > 5) {
				improvedTopics.push({ topic, subject, improvement: diff });
			} else if (diff < -5) {
				declinedTopics.push({ topic, subject, decline: Math.abs(diff) });
			} else {
				stableTopics.push({ topic, subject, accuracy: recentAvg });
			}
		} else if (recent) {
			// New topic - treat as stable
			stableTopics.push({
				topic,
				subject,
				accuracy: recent.total / recent.count,
			});
		}
	}

	const overallTrend: PerformanceTrends['overallTrend'] =
		improvedTopics.length > declinedTopics.length
			? 'improving'
			: declinedTopics.length > improvedTopics.length
				? 'declining'
				: 'stable';

	return { improvedTopics, declinedTopics, stableTopics, overallTrend };
}

// ========================
// STUDY PLAN UPDATER
// ========================

interface StudyPlanUpdateResult {
	success: boolean;
	planId?: string;
	message: string;
}

/**
 * Update study plan based on current performance
 */
export async function updateStudyPlan(
	userId: string,
	topicsNeedingAttention: WeakTopic[]
): Promise<StudyPlanUpdateResult> {
	const db = await dbManager.getDb();

	if (topicsNeedingAttention.length === 0) {
		return { success: false, message: 'No topics need attention' };
	}

	// Get existing study plan
	const existingPlan = await db
		.select()
		.from(studyPlans)
		.where(eq(studyPlans.userId, userId))
		.orderBy(desc(studyPlans.createdAt))
		.limit(1);

	if (existingPlan.length > 0) {
		// Update existing plan
		const topicsList = topicsNeedingAttention.map((t) => `${t.subject}: ${t.topic}`).join(', ');

		await db
			.update(studyPlans)
			.set({
				title: `Updated Study Plan - ${new Date().toLocaleDateString()}`,
				updatedAt: new Date(),
			})
			.where(eq(studyPlans.id, existingPlan[0].id));

		return {
			success: true,
			planId: existingPlan[0].id,
			message: `Study plan updated to focus on: ${topicsList}`,
		};
	}

	// Create new study plan using AI
	const _topicNames = topicsNeedingAttention.map((t) => t.topic);
	const subjects = [...new Set(topicsNeedingAttention.map((t) => t.subject))];

	try {
		const aiStudyPlan = await generateStudyPlan(subjects, 2); // 2 hours per day

		const [newPlan] = await db
			.insert(studyPlans)
			.values({
				userId,
				title: `AI-Generated Study Plan - ${new Date().toLocaleDateString()}`,
				description: aiStudyPlan,
				startDate: new Date(),
				endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return {
			success: true,
			planId: newPlan.id,
			message: 'New AI-generated study plan created',
		};
	} catch (error) {
		console.error('Failed to generate AI study plan:', error);
		return {
			success: false,
			message: 'Failed to generate study plan',
		};
	}
}

// ========================
// TARGETED QUIZ GENERATION
// ========================

interface TargetedQuizRecommendation {
	subject: string;
	topic: string;
	questionCount: number;
	difficulty: 'easy' | 'medium' | 'hard';
	reason: string;
}

/**
 * Generate targeted quiz recommendations
 */
export async function generateTargetedQuizzes(
	_userId: string,
	weakTopics: WeakTopic[]
): Promise<TargetedQuizRecommendation[]> {
	const recommendations: TargetedQuizRecommendation[] = [];

	for (const topic of weakTopics) {
		const difficulty: 'easy' | 'medium' | 'hard' =
			topic.masteryLevel < 0.3 ? 'easy' : topic.masteryLevel < 0.5 ? 'medium' : 'hard';

		recommendations.push({
			subject: topic.subject,
			topic: topic.topic,
			questionCount: topic.masteryLevel < 0.3 ? 10 : 5,
			difficulty,
			reason: `Improve mastery from ${Math.round(topic.masteryLevel * 100)}%`,
		});
	}

	// TODO: Create quiz assignments in database
	// await db.insert(quizAssignments).values(...)

	return recommendations;
}

// ========================
// MASTERY PREDICTION UPDATES
// ========================

/**
 * Update topic mastery predictions based on performance trends
 */
export async function updateTopicMasteryPredictions(
	userId: string,
	trends: PerformanceTrends
): Promise<number> {
	const db = await dbManager.getDb();
	let updateCount = 0;

	// Boost mastery for improved topics
	for (const improved of trends.improvedTopics) {
		const [subject, topic] = [improved.subject, improved.topic];

		await db
			.update(topicMastery)
			.set({
				masteryLevel: sql`${topicMastery.masteryLevel} + 0.05`,
				lastPracticed: new Date(),
			})
			.where(
				and(
					eq(topicMastery.userId, userId),
					eq(topicMastery.subjectId, subject),
					eq(topicMastery.topic, topic)
				)
			);

		updateCount++;
	}

	// Reduce mastery for declined topics (encourage review)
	for (const declined of trends.declinedTopics) {
		const [subject, topic] = [declined.subject, declined.topic];

		await db
			.update(topicMastery)
			.set({
				masteryLevel: sql`GREATEST(0, ${topicMastery.masteryLevel} - 0.03)`,
				lastPracticed: new Date(),
			})
			.where(
				and(
					eq(topicMastery.userId, userId),
					eq(topicMastery.subjectId, subject),
					eq(topicMastery.topic, topic)
				)
			);

		updateCount++;
	}

	return updateCount;
}

// ========================
// RECOMMENDATION GENERATOR
// ========================

/**
 * Generate personalized learning recommendations
 */
export function generateRecommendations(
	state: LearningLoopState,
	trends: PerformanceTrends,
	weakTopics: WeakTopic[]
): LearningRecommendation[] {
	const recommendations: LearningRecommendation[] = [];

	// High-priority: Struggling topics
	for (const weakTopic of weakTopics.filter((t) => t.masteryLevel < 0.3)) {
		recommendations.push({
			type: 'practice',
			subject: weakTopic.subject,
			topic: weakTopic.topic,
			priority: 'high',
			reason: `Critical: ${Math.round(weakTopic.masteryLevel * 100)}% mastery`,
			action: `Start with foundational ${weakTopic.topic} practice`,
		});
	}

	// Medium-priority: Declining topics
	for (const declined of trends.declinedTopics) {
		recommendations.push({
			type: 'review',
			subject: declined.subject,
			topic: declined.topic,
			priority: 'medium',
			reason: `Performance declined by ${Math.round(declined.decline)}%`,
			action: `Review ${declined.topic} concepts`,
		});
	}

	// Low-priority: Maintain strong topics
	for (const stable of trends.stableTopics.filter((t) => t.accuracy > 80)) {
		recommendations.push({
			type: 'advance',
			subject: stable.subject,
			topic: stable.topic,
			priority: 'low',
			reason: `Strong performance (${Math.round(stable.accuracy)}%)`,
			action: `Advance to harder ${stable.topic} problems`,
		});
	}

	// Exam countdown priority
	if (state.recentQuizPerformance.length > 0) {
		const upcomingExams = state.recentQuizPerformance.filter((_qp) => {
			// Check if topic is in upcoming exams
			// TODO: Cross-reference with exam dates
			return false;
		});

		for (const exam of upcomingExams) {
			recommendations.push({
				type: 'study',
				subject: exam.subject,
				topic: exam.topic,
				priority: 'high',
				reason: 'Upcoming exam',
				action: `Focus on ${exam.subject}: ${exam.topic} for exam prep`,
			});
		}
	}

	return recommendations.sort((a, b) => {
		const priorityOrder = { high: 0, medium: 1, low: 2 };
		return priorityOrder[a.priority] - priorityOrder[b.priority];
	});
}

// ========================
// UTILITIES
// ========================

function getRecommendedAction(weakTopic: WeakTopic): string {
	if (weakTopic.masteryLevel < 0.2) {
		return 'Start from basics - review concepts and do easy practice questions';
	}
	if (weakTopic.masteryLevel < 0.4) {
		return 'Practice medium-difficulty questions to build confidence';
	}
	return 'Do mixed-difficulty practice to solidify understanding';
}

function identifyTopicsNeedingAttention(
	state: LearningLoopState,
	trends: PerformanceTrends
): WeakTopic[] {
	const topicsMap = new Map<string, WeakTopic>();

	// Add weak topics
	for (const topic of state.weakTopics) {
		const key = `${topic.subject}::${topic.topic}`;
		topicsMap.set(key, topic);
	}

	// Add declined topics
	for (const declined of trends.declinedTopics) {
		const key = `${declined.subject}::${declined.topic}`;
		if (!topicsMap.has(key)) {
			topicsMap.set(key, {
				subject: declined.subject,
				topic: declined.topic,
				masteryLevel: 0.4, // Estimate
				lastPracticed: null,
				recommendedAction: 'Review needed due to performance decline',
			});
		}
	}

	return Array.from(topicsMap.values());
}
