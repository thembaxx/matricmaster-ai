'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { pastPapers, studySessions, topicMastery } from '@/lib/db/schema';

interface ExamCountdownPlan {
	daysRemaining: number;
	urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
	focusAreas: string[];
	dailyStructure: {
		morning: string[];
		afternoon: string[];
		evening: string[];
	};
	recommendations: string[];
	contentPriority: {
		pastPapers: number;
		flashcards: number;
		aiTutor: number;
		lessons: number;
	};
}

interface PrioritizedContent {
	type: string;
	title: string;
	priority: number;
	reason: string;
}

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

// NSC 2026 exam dates
const NSC_EXAM_DATES = {
	START: new Date('2026-10-27T08:00:00+02:00'),
	END: new Date('2026-11-28T17:00:00+02:00'),
};

/**
 * Calculate days remaining until NSC exams
 */
export function getDaysUntilExam(): number {
	const now = new Date();
	const diff = NSC_EXAM_DATES.START.getTime() - now.getTime();
	return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get urgency level based on days remaining
 */
function getUrgencyLevel(daysRemaining: number): 'low' | 'medium' | 'high' | 'critical' {
	if (daysRemaining > 180) return 'low';
	if (daysRemaining > 90) return 'medium';
	if (daysRemaining > 30) return 'high';
	return 'critical';
}

/**
 * Get content priority distribution based on days remaining
 */
function getContentPriority(daysRemaining: number): ExamCountdownPlan['contentPriority'] {
	if (daysRemaining > 180) {
		return { pastPapers: 15, flashcards: 30, aiTutor: 25, lessons: 30 };
	}
	if (daysRemaining > 90) {
		return { pastPapers: 25, flashcards: 30, aiTutor: 20, lessons: 25 };
	}
	if (daysRemaining > 30) {
		return { pastPapers: 40, flashcards: 30, aiTutor: 20, lessons: 10 };
	}
	return { pastPapers: 50, flashcards: 35, aiTutor: 10, lessons: 5 };
}

/**
 * Get daily structure based on days remaining
 */
function getDailyStructure(daysRemaining: number): ExamCountdownPlan['dailyStructure'] {
	if (daysRemaining > 180) {
		return {
			morning: ['New topic learning', 'AI tutor for difficult concepts'],
			afternoon: ['Practice exercises', 'Flashcard review'],
			evening: ['Light review', 'Prepare next day'],
		};
	}
	if (daysRemaining > 90) {
		return {
			morning: ['Topic review', 'Practice problems'],
			afternoon: ['Past paper sections', 'Weak area focus'],
			evening: ['Flashcard review', 'Quick assessment'],
		};
	}
	if (daysRemaining > 30) {
		return {
			morning: ['Full past paper sections', 'Timed practice'],
			afternoon: ['Review mistakes', 'Targeted practice'],
			evening: ['Flashcard blitz', 'Formula memorization'],
		};
	}
	return {
		morning: ['Full past papers under exam conditions'],
		afternoon: ['Intensive review of mistakes'],
		evening: ['Formula and definition review', 'Light study only'],
	};
}

/**
 * Get recommendations based on days remaining
 */
function getRecommendations(daysRemaining: number): string[] {
	if (daysRemaining > 180) {
		return [
			'Focus on understanding concepts deeply',
			'Build a strong foundation in all subjects',
			'Develop consistent study habits',
			'Explore different learning resources',
		];
	}
	if (daysRemaining > 90) {
		return [
			'Start working through past papers',
			'Identify and focus on weak areas',
			'Create summary notes for quick revision',
			'Set up a regular study schedule',
		];
	}
	if (daysRemaining > 30) {
		return [
			'Complete at least 2 past papers per week',
			'Focus heavily on exam technique',
			'Revise summary notes daily',
			'Practice time management',
		];
	}
	return [
		'Focus on past papers and mark schemes',
		'Review all formulas and key definitions',
		'Practice time management',
		'Get enough sleep - avoid cramming late',
		'Stay calm and confident',
	];
}

/**
 * Get prioritized study plan based on exam countdown
 */
export async function getExamCountdownPlan(): Promise<ExamCountdownPlan> {
	try {
		const daysRemaining = getDaysUntilExam();
		const urgencyLevel = getUrgencyLevel(daysRemaining);
		const contentPriority = getContentPriority(daysRemaining);
		const dailyStructure = getDailyStructure(daysRemaining);
		const recommendations = getRecommendations(daysRemaining);

		// Get user-specific focus areas based on weak topics
		const auth = await getAuth();
		const session = await auth.api.getSession();
		const focusAreas: string[] = [];

		if (session?.user) {
			const db = await getDb();

			// Get topics with low mastery
			const weakTopics = await db.query.topicMastery.findMany({
				where: and(
					eq(topicMastery.userId, session.user.id),
					sql`${topicMastery.masteryLevel} < 0.6`
				),
				orderBy: [desc(topicMastery.masteryLevel)],
				limit: 5,
			});

			for (const t of weakTopics) {
				focusAreas.push(t.topic);
			}
		}

		return {
			daysRemaining,
			urgencyLevel,
			focusAreas,
			dailyStructure,
			recommendations,
			contentPriority,
		};
	} catch (error) {
		console.error('getExamCountdownPlan failed:', error);
		// Return default plan on error
		return {
			daysRemaining: getDaysUntilExam(),
			urgencyLevel: 'medium',
			focusAreas: [],
			dailyStructure: getDailyStructure(120),
			recommendations: getRecommendations(120),
			contentPriority: getContentPriority(120),
		};
	}
}

/**
 * Get content recommendations based on days remaining
 */
export async function getPrioritizedContent(subject: string): Promise<PrioritizedContent[]> {
	try {
		const daysRemaining = getDaysUntilExam();
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) return [];

		const db = await getDb();
		const content: PrioritizedContent[] = [];

		// Get past papers - higher priority as exam approaches
		const papers = await db.query.pastPapers.findMany({
			where: and(eq(pastPapers.subject, subject), eq(pastPapers.isExtracted, true)),
			limit: 10,
		});

		for (const paper of papers) {
			const priority = daysRemaining <= 30 ? 90 : daysRemaining <= 90 ? 70 : 50;
			content.push({
				type: 'past-paper',
				title: paper.title || `${paper.paper} ${paper.month} ${paper.year}`,
				priority,
				reason: daysRemaining <= 30 ? 'Exam practice' : 'Build familiarity',
			});
		}

		// Sort by priority
		content.sort((a, b) => b.priority - a.priority);
		return content.slice(0, 10);
	} catch (error) {
		console.error('getPrioritizedContent failed:', error);
		return [];
	}
}

/**
 * Get study intensity recommendation based on days remaining
 */
export function getStudyIntensity(daysRemaining: number): {
	hoursPerDay: number;
	breakFrequency: string;
	intensity: string;
} {
	if (daysRemaining > 180) {
		return {
			hoursPerDay: 2,
			breakFrequency: '45 min study, 10 min break',
			intensity: 'Relaxed - build habits',
		};
	}
	if (daysRemaining > 90) {
		return {
			hoursPerDay: 3,
			breakFrequency: '50 min study, 10 min break',
			intensity: 'Moderate - consistent progress',
		};
	}
	if (daysRemaining > 30) {
		return {
			hoursPerDay: 4,
			breakFrequency: '55 min study, 5 min break',
			intensity: 'Intensive - focused revision',
		};
	}
	return {
		hoursPerDay: 5,
		breakFrequency: '60 min study, 10 min break',
		intensity: 'Critical - final push',
	};
}

/**
 * Get weekly study plan structure based on days remaining
 */
export function getWeeklyStructure(daysRemaining: number): {
	monday: string[];
	tuesday: string[];
	wednesday: string[];
	thursday: string[];
	friday: string[];
	saturday: string[];
	sunday: string[];
} {
	if (daysRemaining > 180) {
		return {
			monday: ['Mathematics', 'Physical Sciences'],
			tuesday: ['Life Sciences', 'English'],
			wednesday: ['Mathematics', 'Third Subject'],
			thursday: ['Physical Sciences', 'English'],
			friday: ['Light review', 'Practice questions'],
			saturday: ['Past paper practice', 'Weak areas'],
			sunday: ['Rest', 'Light flashcard review'],
		};
	}
	if (daysRemaining > 90) {
		return {
			monday: ['Mathematics deep dive', 'Practice problems'],
			tuesday: ['Physical Sciences', 'Lab concepts'],
			wednesday: ['Life Sciences', 'Memorization'],
			thursday: ['English', 'Essay practice'],
			friday: ['Third Subject', 'All subjects review'],
			saturday: ['Full past paper practice'],
			sunday: ['Review mistakes', 'Plan next week'],
		};
	}
	return {
		monday: ['Full Mathematics paper', 'Review'],
		tuesday: ['Full Physical Sciences paper', 'Review'],
		wednesday: ['Full Life Sciences paper', 'Review'],
		thursday: ['Full English paper', 'Review'],
		friday: ['Third Subject paper', 'All weak areas'],
		saturday: ['Timed practice', 'Formula drilling'],
		sunday: ['Light review only', 'Rest and recover'],
	};
}

/**
 * Calculate study streak and consistency score
 */
export async function getStudyConsistency(): Promise<{
	currentStreak: number;
	weeklyTarget: number;
	weeklyActual: number;
	consistencyScore: number;
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return { currentStreak: 0, weeklyTarget: 5, weeklyActual: 0, consistencyScore: 0 };
		}

		const db = await getDb();
		const userId = session.user.id;

		// Get study sessions from the last 7 days
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);

		const recentSessions = await db.query.studySessions.findMany({
			where: and(eq(studySessions.userId, userId), sql`${studySessions.startedAt} >= ${weekAgo}`),
			orderBy: [desc(studySessions.startedAt)],
		});

		// Count unique days with study sessions
		const uniqueDays = new Set(
			recentSessions.map((s) => {
				const date = new Date(s.startedAt || new Date());
				return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
			})
		);

		// Calculate current streak
		let currentStreak = 0;
		const today = new Date();
		for (let i = 0; i < 30; i++) {
			const checkDate = new Date(today);
			checkDate.setDate(checkDate.getDate() - i);
			const _dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

			const hasSession = recentSessions.some((s) => {
				const sessionDate = new Date(s.startedAt || new Date());
				return (
					sessionDate.getFullYear() === checkDate.getFullYear() &&
					sessionDate.getMonth() === checkDate.getMonth() &&
					sessionDate.getDate() === checkDate.getDate()
				);
			});

			if (hasSession) {
				currentStreak++;
			} else if (i > 0) {
				break;
			}
		}

		const weeklyTarget = 5;
		const weeklyActual = uniqueDays.size;
		const consistencyScore = Math.round((weeklyActual / weeklyTarget) * 100);

		return {
			currentStreak,
			weeklyTarget,
			weeklyActual,
			consistencyScore: Math.min(100, consistencyScore),
		};
	} catch (error) {
		console.error('getStudyConsistency failed:', error);
		return { currentStreak: 0, weeklyTarget: 5, weeklyActual: 0, consistencyScore: 0 };
	}
}

export type { ExamCountdownPlan, PrioritizedContent };
export { NSC_EXAM_DATES };
