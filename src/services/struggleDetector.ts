'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { conceptStruggles, questionAttempts, questions, topicConfidence } from '@/lib/db/schema';

export interface Struggle {
	topic: string;
	subject: string;
	reason: 'low_score' | 'repeated_mistakes' | 'declining_confidence';
	severity: 'high' | 'medium' | 'low';
	suggestions: string[];
}

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export async function detectStruggles(userId: string): Promise<Struggle[]> {
	const db = await getDb();
	const struggles: Struggle[] = [];
	const seenTopics = new Set<string>();

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	// 1. Query topicConfidence for scores < 60%
	const lowConfidences = await db
		.select({
			topic: topicConfidence.topic,
			subject: topicConfidence.subject,
			confidenceScore: topicConfidence.confidenceScore,
		})
		.from(topicConfidence)
		.where(and(eq(topicConfidence.userId, userId), sql`${topicConfidence.confidenceScore} < 0.6`));

	for (const entry of lowConfidences) {
		if (seenTopics.has(entry.topic)) continue;
		seenTopics.add(entry.topic);

		const score = Number(entry.confidenceScore);
		const severity = score < 0.3 ? 'high' : score < 0.45 ? 'medium' : 'low';

		const suggestions: string[] = [];
		if (severity === 'high') {
			suggestions.push('Ask the AI Tutor to explain this topic from scratch');
			suggestions.push('Try flashcards for focused repetition');
			suggestions.push('Review the foundational concepts first');
		} else if (severity === 'medium') {
			suggestions.push('Practice with a quiz on this topic');
			suggestions.push('Ask the AI Tutor for step-by-step explanations');
		} else {
			suggestions.push('Do a quick review quiz to solidify your knowledge');
		}

		struggles.push({
			topic: entry.topic,
			subject: entry.subject,
			reason: 'low_score',
			severity,
			suggestions,
		});
	}

	// 2. Query conceptStruggles for topics with 3+ entries in last 7 days
	const repeatedStruggles = await db
		.select({
			concept: conceptStruggles.concept,
			struggleCount: conceptStruggles.struggleCount,
		})
		.from(conceptStruggles)
		.where(
			and(
				eq(conceptStruggles.userId, userId),
				eq(conceptStruggles.isResolved, false),
				gte(conceptStruggles.lastStruggleAt, sevenDaysAgo),
				sql`${conceptStruggles.struggleCount} >= 3`
			)
		);

	for (const entry of repeatedStruggles) {
		if (seenTopics.has(entry.concept)) {
			const existing = struggles.find((s) => s.topic === entry.concept);
			if (existing) {
				existing.reason = 'repeated_mistakes';
				existing.severity = 'high';
				if (!existing.suggestions.includes('You have made mistakes on this 3+ times this week')) {
					existing.suggestions.unshift('You have made mistakes on this 3+ times this week');
				}
			}
			continue;
		}
		seenTopics.add(entry.concept);

		struggles.push({
			topic: entry.concept,
			subject: '',
			reason: 'repeated_mistakes',
			severity: 'high',
			suggestions: [
				'You have made mistakes on this 3+ times this week',
				'Ask the AI Tutor for a detailed explanation',
				'Try a focused practice quiz on this topic',
			],
		});
	}

	// 3. Query topicMastery for declining trends (mastery < 0.5 and attempted recently)
	const topicScores = await db
		.select({
			topic: questions.topic,
			totalAttempts: sql<number>`count(*)::int`,
			correctAttempts: sql<number>`count(case when ${questionAttempts.isCorrect} = true then 1 end)::int`,
		})
		.from(questionAttempts)
		.innerJoin(questions, eq(questions.id, sql`${questionAttempts.questionId}::uuid`))
		.where(
			and(eq(questionAttempts.userId, userId), gte(questionAttempts.attemptedAt, sevenDaysAgo))
		)
		.groupBy(questions.topic);

	for (const ts of topicScores) {
		if (seenTopics.has(ts.topic)) continue;
		const accuracy = ts.totalAttempts > 0 ? ts.correctAttempts / ts.totalAttempts : 1;
		if (accuracy < 0.5 && ts.totalAttempts >= 2) {
			seenTopics.add(ts.topic);
			struggles.push({
				topic: ts.topic,
				subject: '',
				reason: 'declining_confidence',
				severity: accuracy < 0.3 ? 'high' : 'medium',
				suggestions: [
					'Your recent performance has been declining',
					'Schedule a review session for this topic',
					'Ask the AI Tutor for targeted help',
				],
			});
		}
	}

	return struggles.sort((a, b) => {
		const severityOrder = { high: 0, medium: 1, low: 2 };
		return severityOrder[a.severity] - severityOrder[b.severity];
	});
}
