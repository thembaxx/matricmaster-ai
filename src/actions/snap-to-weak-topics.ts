'use server';

import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	conceptStruggles,
	questionAttempts,
	subjects,
	topicConfidence,
	topicMastery,
} from '@/lib/db/schema';

interface SnapAnalysisResult {
	topic: string;
	subject: string;
	wasCorrect: boolean;
	difficulty: 'easy' | 'medium' | 'hard';
	concepts: string[];
}

/**
 * Record a Snap and Solve result and update weak topic tracking
 */
export async function recordSnapResult(
	result: SnapAnalysisResult
): Promise<{ success: boolean; weakTopicsUpdated: string[] }> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) return { success: false, weakTopicsUpdated: [] };

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return { success: false, weakTopicsUpdated: [] };

	const db = await dbManager.getDb();
	const userId = session.user.id;
	const weakTopicsUpdated: string[] = [];

	// Record question attempt
	await db.insert(questionAttempts).values({
		id: crypto.randomUUID(),
		userId,
		questionId: `snap-${Date.now()}`,
		topic: result.topic,
		isCorrect: result.wasCorrect,
		attemptedAt: new Date(),
	});

	// If incorrect, update concept struggles
	if (!result.wasCorrect) {
		// Check for existing struggle
		const existingStruggle = await db.query.conceptStruggles.findFirst({
			where: and(eq(conceptStruggles.userId, userId), eq(conceptStruggles.concept, result.topic)),
		});

		if (existingStruggle) {
			// Update struggle count
			await db
				.update(conceptStruggles)
				.set({
					struggleCount: existingStruggle.struggleCount + 1,
					lastStruggleAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(conceptStruggles.id, existingStruggle.id));
		} else {
			// Create new struggle record
			await db.insert(conceptStruggles).values({
				id: crypto.randomUUID(),
				userId,
				concept: result.topic,
				struggleCount: 1,
				lastStruggleAt: new Date(),
				isResolved: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		weakTopicsUpdated.push(result.topic);

		// Update topic confidence
		const existingConfidence = await db.query.topicConfidence.findFirst({
			where: and(eq(topicConfidence.userId, userId), eq(topicConfidence.topic, result.topic)),
		});

		if (existingConfidence) {
			const newConfidence = Math.max(0, Number(existingConfidence.confidenceScore) - 0.1);
			await db
				.update(topicConfidence)
				.set({
					confidenceScore: newConfidence.toFixed(2),
					updatedAt: new Date(),
				})
				.where(eq(topicConfidence.id, existingConfidence.id));
		} else {
			await db.insert(topicConfidence).values({
				id: crypto.randomUUID(),
				userId,
				topic: result.topic,
				subject: result.subject,
				confidenceScore: '0.4',
				updatedAt: new Date(),
			});
		}
	} else {
		// If correct, update confidence positively
		const existingConfidence = await db.query.topicConfidence.findFirst({
			where: and(eq(topicConfidence.userId, userId), eq(topicConfidence.topic, result.topic)),
		});

		if (existingConfidence) {
			const newConfidence = Math.min(1, Number(existingConfidence.confidenceScore) + 0.05);
			await db
				.update(topicConfidence)
				.set({
					confidenceScore: newConfidence.toFixed(2),
					updatedAt: new Date(),
				})
				.where(eq(topicConfidence.id, existingConfidence.id));
		} else {
			await db.insert(topicConfidence).values({
				id: crypto.randomUUID(),
				userId,
				topic: result.topic,
				subject: result.subject,
				confidenceScore: '0.6',
				updatedAt: new Date(),
			});
		}
	}

	// Update topic mastery - need to find subjectId first
	const subjectResult = await db.query.subjects.findFirst({
		where: eq(subjects.slug, result.subject.toLowerCase().replace(/\s+/g, '-')),
	});

	const subjectId = subjectResult?.id || 1;

	const existingMastery = await db.query.topicMastery.findFirst({
		where: and(eq(topicMastery.userId, userId), eq(topicMastery.topic, result.topic)),
	});

	if (existingMastery) {
		const newCorrect = existingMastery.questionsCorrect + (result.wasCorrect ? 1 : 0);
		const newAttempted = existingMastery.questionsAttempted + 1;
		const newMastery = newCorrect / newAttempted;

		await db
			.update(topicMastery)
			.set({
				questionsCorrect: newCorrect,
				questionsAttempted: newAttempted,
				masteryLevel: newMastery.toFixed(2),
				lastPracticed: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(topicMastery.id, existingMastery.id));
	} else {
		await db.insert(topicMastery).values({
			id: crypto.randomUUID(),
			userId,
			subjectId,
			topic: result.topic,
			masteryLevel: result.wasCorrect ? '0.6' : '0.4',
			questionsCorrect: result.wasCorrect ? 1 : 0,
			questionsAttempted: 1,
			consecutiveCorrect: result.wasCorrect ? 1 : 0,
			lastPracticed: new Date(),
		});
	}

	// Also record all detected concepts
	for (const concept of result.concepts) {
		if (concept === result.topic) continue;

		const existingConcept = await db.query.topicConfidence.findFirst({
			where: and(eq(topicConfidence.userId, userId), eq(topicConfidence.topic, concept)),
		});

		if (!existingConcept) {
			await db.insert(topicConfidence).values({
				id: crypto.randomUUID(),
				userId,
				topic: concept,
				subject: result.subject,
				confidenceScore: result.wasCorrect ? '0.55' : '0.45',
				updatedAt: new Date(),
			});
		}
	}

	return { success: true, weakTopicsUpdated };
}

/**
 * Get weak topics that were identified from Snap and Solve
 */
export async function getSnapIdentifiedWeakTopics(
	limit = 10
): Promise<Array<{ topic: string; subject: string; struggleCount: number; confidence: number }>> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	if (!session?.user) return [];

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) return [];

	const db = await dbManager.getDb();
	const userId = session.user.id;

	// Get topics with low confidence
	const lowConfidence = await db.query.topicConfidence.findMany({
		where: eq(topicConfidence.userId, userId),
		orderBy: [{ confidenceScore: 'asc' }],
		limit,
	});

	// Enrich with struggle data
	const results: Array<{
		topic: string;
		subject: string;
		struggleCount: number;
		confidence: number;
	}> = [];

	for (const topic of lowConfidence) {
		const struggle = await db.query.conceptStruggles.findFirst({
			where: and(eq(conceptStruggles.userId, userId), eq(conceptStruggles.concept, topic.topic)),
		});

		results.push({
			topic: topic.topic,
			subject: topic.subject || 'General',
			struggleCount: struggle?.struggleCount || 0,
			confidence: Number(topic.confidenceScore),
		});
	}

	return results;
}
