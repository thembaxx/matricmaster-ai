import { and, asc, desc, eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { conceptStruggles, studyPlans, topicConfidence } from '@/lib/db/schema';

export interface WeakTopic {
	topic: string;
	subject: string;
	confidenceScore: number;
	timesAttempted: number;
}

export interface StrongTopic {
	topic: string;
	subject: string;
	confidenceScore: number;
}

export interface ActiveStudyPlan {
	id: string;
	title: string;
	targetExamDate: Date | null;
	focusAreas: string | null;
	weeklyGoals: string | null;
}

export interface RecentPerformance {
	subject: string;
	averageScore: number;
	trend: 'improving' | 'stable' | 'declining';
	totalAttempts: number;
}

export interface ConceptStruggle {
	concept: string;
	struggleCount: number;
	isResolved: boolean;
	lastStruggleAt: Date | null;
}

export interface TutorContext {
	weakTopics: WeakTopic[];
	strongTopics: StrongTopic[];
	activeStudyPlan: ActiveStudyPlan | null;
	recentPerformance: RecentPerformance[];
	conceptStruggles: ConceptStruggle[];
	hasContext: boolean;
}

/**
 * Gather user context for personalized AI tutoring.
 * Fetches weak/strong topics, study plans, recent performance, and concept struggles.
 */
export async function getTutorContext(userId: string): Promise<TutorContext> {
	try {
		const db = await getDb();

		// Fetch topic confidence data (weak/strong topics)
		const topicConfidenceData = await db
			.select({
				topic: topicConfidence.topic,
				subject: topicConfidence.subject,
				confidenceScore: topicConfidence.confidenceScore,
				timesAttempted: topicConfidence.timesAttempted,
				timesCorrect: topicConfidence.timesCorrect,
			})
			.from(topicConfidence)
			.where(eq(topicConfidence.userId, userId))
			.orderBy(asc(topicConfidence.confidenceScore));

		// Get weak topics (confidence < 0.6)
		const weakTopics: WeakTopic[] = topicConfidenceData
			.filter((t) => Number(t.confidenceScore) < 0.6 && t.timesAttempted >= 3)
			.slice(0, 5)
			.map((t) => ({
				topic: t.topic,
				subject: t.subject,
				confidenceScore: Number(t.confidenceScore),
				timesAttempted: t.timesAttempted,
			}));

		// Get strong topics (confidence >= 0.8)
		const strongTopics: StrongTopic[] = topicConfidenceData
			.filter((t) => Number(t.confidenceScore) >= 0.8)
			.slice(0, 5)
			.map((t) => ({
				topic: t.topic,
				subject: t.subject,
				confidenceScore: Number(t.confidenceScore),
			}));

		// Fetch active study plan
		const [activePlan] = await db
			.select()
			.from(studyPlans)
			.where(and(eq(studyPlans.userId, userId), eq(studyPlans.isActive, true)))
			.orderBy(desc(studyPlans.createdAt))
			.limit(1);

		const activeStudyPlan: ActiveStudyPlan | null = activePlan
			? {
					id: activePlan.id,
					title: activePlan.title,
					targetExamDate: activePlan.targetExamDate,
					focusAreas: activePlan.focusAreas,
					weeklyGoals: activePlan.weeklyGoals,
				}
			: null;

		// Fetch recent performance from topic confidence aggregation
		// Group by subject and calculate trends
		const performanceBySubject = new Map<string, { scores: number[]; attempts: number }>();

		for (const tc of topicConfidenceData) {
			const existing = performanceBySubject.get(tc.subject) || {
				scores: [],
				attempts: 0,
			};
			existing.scores.push(Number(tc.confidenceScore) * 100);
			existing.attempts += tc.timesAttempted;
			performanceBySubject.set(tc.subject, existing);
		}

		const recentPerformance: RecentPerformance[] = [];
		for (const [subject, data] of performanceBySubject) {
			const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;

			// Simple trend calculation based on topic distribution
			const lowConfidence = data.scores.filter((s) => s < 60).length;
			const highConfidence = data.scores.filter((s) => s >= 80).length;

			let trend: 'improving' | 'stable' | 'declining' = 'stable';
			if (highConfidence > lowConfidence) trend = 'improving';
			else if (lowConfidence > highConfidence * 2) trend = 'declining';

			recentPerformance.push({
				subject,
				averageScore: Math.round(avgScore),
				trend,
				totalAttempts: data.attempts,
			});
		}

		// Sort by total attempts (most practiced subjects first)
		recentPerformance.sort((a, b) => b.totalAttempts - a.totalAttempts);

		// Fetch concept struggles
		const conceptStrugglesData = await db
			.select({
				concept: conceptStruggles.concept,
				struggleCount: conceptStruggles.struggleCount,
				isResolved: conceptStruggles.isResolved,
				lastStruggleAt: conceptStruggles.lastStruggleAt,
			})
			.from(conceptStruggles)
			.where(and(eq(conceptStruggles.userId, userId), eq(conceptStruggles.isResolved, false)))
			.orderBy(desc(conceptStruggles.struggleCount))
			.limit(10);

		const conceptStrugglesList: ConceptStruggle[] = conceptStrugglesData.map((c) => ({
			concept: c.concept,
			struggleCount: c.struggleCount,
			isResolved: c.isResolved,
			lastStruggleAt: c.lastStruggleAt,
		}));

		const hasContext =
			weakTopics.length > 0 ||
			strongTopics.length > 0 ||
			activeStudyPlan !== null ||
			recentPerformance.length > 0 ||
			conceptStrugglesList.length > 0;

		return {
			weakTopics,
			strongTopics,
			activeStudyPlan,
			recentPerformance,
			conceptStruggles: conceptStrugglesList,
			hasContext,
		};
	} catch (error) {
		console.warn('[AI Tutor] Failed to fetch user context:', error);
		// Return empty context on error - don't fail the tutoring session
		return {
			weakTopics: [],
			strongTopics: [],
			activeStudyPlan: null,
			recentPerformance: [],
			conceptStruggles: [],
			hasContext: false,
		};
	}
}

/**
 * Format tutor context into a system prompt section.
 */
export function formatContextForPrompt(context: TutorContext): string {
	if (!context.hasContext) {
		return '';
	}

	const sections: string[] = [];

	if (context.weakTopics.length > 0) {
		sections.push(
			`## Student's Weak Areas (prioritize these):\n${context.weakTopics
				.map(
					(t) =>
						`- ${t.topic} (${t.subject}, confidence: ${Math.round(t.confidenceScore * 100)}%, attempted ${t.timesAttempted} times)`
				)
				.join('\n')}`
		);
	}

	if (context.strongTopics.length > 0) {
		sections.push(
			`## Student's Strong Areas:\n${context.strongTopics
				.map(
					(t) => `- ${t.topic} (${t.subject}, confidence: ${Math.round(t.confidenceScore * 100)}%)`
				)
				.join('\n')}`
		);
	}

	if (context.activeStudyPlan) {
		const plan = context.activeStudyPlan;
		const parts: string[] = [`- Title: ${plan.title}`];
		if (plan.targetExamDate) {
			parts.push(`- Target date: ${new Date(plan.targetExamDate).toLocaleDateString()}`);
		}
		if (plan.focusAreas) {
			parts.push(`- Focus areas: ${plan.focusAreas}`);
		}
		if (plan.weeklyGoals) {
			parts.push(`- Weekly goals: ${plan.weeklyGoals}`);
		}
		sections.push(`## Current Study Plan:\n${parts.join('\n')}`);
	}

	if (context.recentPerformance.length > 0) {
		sections.push(
			`## Recent Performance by Subject:\n${context.recentPerformance
				.map(
					(p) =>
						`- ${p.subject}: ${p.averageScore}% average (${p.trend}, ${p.totalAttempts} attempts)`
				)
				.join('\n')}`
		);
	}

	if (context.conceptStruggles.length > 0) {
		sections.push(
			`## Concepts Student Has Struggled With:\n${context.conceptStruggles
				.map(
					(c) =>
						`- ${c.concept} (struggled ${c.struggleCount} times, last: ${c.lastStruggleAt ? new Date(c.lastStruggleAt).toLocaleDateString() : 'recently'})`
				)
				.join('\n')}`
		);
	}

	return sections.join('\n\n');
}

/**
 * Create a concise context summary for conversation metadata.
 */
export function createContextSummary(context: TutorContext): {
	weakTopics: string[];
	activeStudyPlan: string | null;
	recentPerformance: { subject: string; score: number }[];
} {
	return {
		weakTopics: context.weakTopics.map((t) => t.topic),
		activeStudyPlan: context.activeStudyPlan?.title || null,
		recentPerformance: context.recentPerformance.map((p) => ({
			subject: p.subject,
			score: p.averageScore,
		})),
	};
}
