'use server';

import { and, desc, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { conceptStruggles, studyBuddyProfiles, topicConfidence } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export type BuddyPersonality = 'mentor' | 'tutor' | 'friend';

export interface BuddyProfile {
	id: string;
	userId: string;
	personality: BuddyPersonality;
}

export interface ConceptStruggleInfo {
	id: string;
	concept: string;
	struggleCount: number;
	lastStruggleAt: Date;
	isResolved: boolean;
}

export interface TopicConfidenceInfo {
	id: string;
	topic: string;
	subject: string;
	confidenceScore: string | number;
	timesCorrect: number;
	timesAttempted: number;
}

async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		throw new Error('Unauthorized');
	}
	return session.user;
}

export async function getBuddyProfile(): Promise<BuddyProfile | null> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const profile = await db.query.studyBuddyProfiles.findFirst({
			where: eq(studyBuddyProfiles.userId, user.id),
		});

		if (!profile) {
			const [created] = await db
				.insert(studyBuddyProfiles)
				.values({ userId: user.id, personality: 'mentor' })
				.returning();
			return {
				id: created.id,
				userId: created.userId,
				personality: created.personality as BuddyPersonality,
			};
		}

		return {
			id: profile.id,
			userId: profile.userId,
			personality: (profile.personality || 'mentor') as BuddyPersonality,
		};
	} catch (error) {
		console.error('Error in getBuddyProfile:', error);
		console.debug('Stack trace:', error instanceof Error ? error.stack : 'No stack');
		return null;
	}
}

export async function setBuddyPersonality(personality: BuddyPersonality): Promise<void> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const existing = await db.query.studyBuddyProfiles.findFirst({
			where: eq(studyBuddyProfiles.userId, user.id),
		});

		if (existing) {
			await db
				.update(studyBuddyProfiles)
				.set({ personality, updatedAt: new Date() })
				.where(eq(studyBuddyProfiles.id, existing.id));
		} else {
			await db.insert(studyBuddyProfiles).values({ userId: user.id, personality });
		}
	} catch (error) {
		console.debug('Error in setBuddyPersonality:', error);
		throw error;
	}
}

export async function recordStruggle(concept: string): Promise<void> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const existing = await db.query.conceptStruggles.findFirst({
			where: and(eq(conceptStruggles.userId, user.id), eq(conceptStruggles.concept, concept)),
		});

		if (existing) {
			await db
				.update(conceptStruggles)
				.set({
					struggleCount: existing.struggleCount + 1,
					lastStruggleAt: new Date(),
					isResolved: false,
					updatedAt: new Date(),
				})
				.where(eq(conceptStruggles.id, existing.id));
		} else {
			await db.insert(conceptStruggles).values({
				userId: user.id,
				concept,
				struggleCount: 1,
			});
		}
	} catch (error) {
		console.debug('Error in recordStruggle:', error);
		throw error;
	}
}

export async function resolveConcept(concept: string): Promise<void> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		await db
			.update(conceptStruggles)
			.set({ isResolved: true, updatedAt: new Date() })
			.where(and(eq(conceptStruggles.userId, user.id), eq(conceptStruggles.concept, concept)));
	} catch (error) {
		console.debug('Error in resolveConcept:', error);
		throw error;
	}
}

export async function updateConfidence(
	topic: string,
	subject: string,
	isCorrect: boolean
): Promise<void> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const existing = await db.query.topicConfidence.findFirst({
			where: and(
				eq(topicConfidence.userId, user.id),
				eq(topicConfidence.topic, topic),
				eq(topicConfidence.subject, subject)
			),
		});

		if (existing) {
			const newAttempted = existing.timesAttempted + 1;
			const newCorrect = existing.timesCorrect + (isCorrect ? 1 : 0);
			const newScore = newAttempted > 0 ? newCorrect / newAttempted : 0;

			await db
				.update(topicConfidence)
				.set({
					timesCorrect: newCorrect,
					timesAttempted: newAttempted,
					confidenceScore: newScore.toFixed(2) as unknown as typeof topicConfidence.confidenceScore,
					lastAttemptAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(topicConfidence.id, existing.id));
		} else {
			await db.insert(topicConfidence).values({
				userId: user.id,
				topic,
				subject,
				timesCorrect: isCorrect ? 1 : 0,
				timesAttempted: 1,
				confidenceScore: isCorrect ? '1.00' : '0.00',
				lastAttemptAt: new Date(),
			});
		}
	} catch (error) {
		console.debug('Error in updateConfidence:', error);
		throw error;
	}
}

export async function getAdaptiveHint(topic: string): Promise<string | null> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const confidence = await db.query.topicConfidence.findFirst({
			where: and(eq(topicConfidence.userId, user.id), eq(topicConfidence.topic, topic)),
		});

		if (confidence && Number.parseFloat(confidence.confidenceScore as string) < 0.5) {
			const { getExplanation } = await import('@/services/geminiService');
			const explanation = await getExplanation('General', topic);
			return `Quick reminder: ${explanation.slice(0, 200)}...`;
		}

		return null;
	} catch (error) {
		console.debug('Error in getAdaptiveHint:', error);
		return null;
	}
}

export async function getStrugglingConcepts(): Promise<ConceptStruggleInfo[]> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const results = await db.query.conceptStruggles.findMany({
			where: and(eq(conceptStruggles.userId, user.id), eq(conceptStruggles.isResolved, false)),
			orderBy: [desc(conceptStruggles.struggleCount)],
			limit: 10,
		});

		return results as ConceptStruggleInfo[];
	} catch (error) {
		console.error('Error in getStrugglingConcepts:', error);
		console.debug('Stack trace:', error instanceof Error ? error.stack : 'No stack');
		return [];
	}
}

export async function getTopicConfidence(): Promise<TopicConfidenceInfo[]> {
	try {
		const user = await ensureAuthenticated();
		const db = await getDb();

		const results = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, user.id),
			orderBy: [desc(topicConfidence.timesAttempted)],
			limit: 20,
		});

		return results.map((r) => ({
			id: r.id,
			topic: r.topic,
			subject: r.subject,
			confidenceScore: r.confidenceScore,
			timesCorrect: r.timesCorrect,
			timesAttempted: r.timesAttempted,
		}));
	} catch (error) {
		console.debug('Error in getTopicConfidence:', error);
		return [];
	}
}
