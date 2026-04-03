'use server';

import { and, desc, eq, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { conceptStruggles, topicConfidence, topicMastery } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

export interface Nudge {
	id: string;
	type: 'concept_struggle' | 'weak_topic' | 'streak_warning' | 'achievement_progress';
	title: string;
	message: string;
	priority: number;
	actionUrl?: string;
	actionLabel?: string;
	createdAt: Date;
}

export async function checkForNudges(): Promise<Nudge[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	const db = await getDb();
	const nudges: Nudge[] = [];

	const struggles = await db.query.conceptStruggles.findMany({
		where: and(
			eq(conceptStruggles.userId, session.user.id),
			eq(conceptStruggles.isResolved, false)
		),
		orderBy: [desc(conceptStruggles.struggleCount)],
		limit: 3,
	});

	if (struggles.length > 0) {
		const topStruggle = struggles[0];
		nudges.push({
			id: `struggle-${topStruggle.id}`,
			type: 'concept_struggle',
			title: 'Concept Struggle Detected',
			message: `You've been struggling with "${topStruggle.concept}". Let's work through it together.`,
			priority: 100 - topStruggle.struggleCount * 10,
			actionUrl: `/ai-tutor?topic=${encodeURIComponent(topStruggle.concept)}`,
			actionLabel: 'Get Help Now',
			createdAt: topStruggle.lastStruggleAt || new Date(),
		});
	}

	const weakTopics = await db.query.topicConfidence.findMany({
		where: and(
			eq(topicConfidence.userId, session.user.id),
			sql`${topicConfidence.confidenceScore} < 0.3`
		),
		limit: 5,
	});

	if (weakTopics.length > 2) {
		nudges.push({
			id: 'weak-topics',
			type: 'weak_topic',
			title: 'Focus Area Identified',
			message: `You have ${weakTopics.length} topics that need attention. Let's prioritize.`,
			priority: 60,
			actionUrl: '/curriculum-map',
			actionLabel: 'View Progress',
			createdAt: new Date(),
		});
	}

	const masteries = await db.query.topicMastery.findMany({
		where: sql`${topicMastery.userId} = ${session.user.id} AND ${topicMastery.masteryLevel} < 0.5`,
		limit: 5,
	});

	for (const mastery of masteries) {
		const confidence = weakTopics.find(
			(c: (typeof weakTopics)[number]) => c.topic === mastery.topic
		);
		if (confidence && Number(confidence.confidenceScore) > Number(mastery.masteryLevel)) {
			nudges.push({
				id: `regression-${mastery.id}`,
				type: 'weak_topic',
				title: 'Topic Regression Detected',
				message: `Your confidence in "${mastery.topic}" has dropped. Time for a refresher?`,
				priority: 50,
				actionUrl: `/flashcards?topic=${encodeURIComponent(mastery.topic)}`,
				actionLabel: 'Review Flashcards',
				createdAt: new Date(),
			});
			break;
		}
	}

	return nudges.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export async function dismissNudge(nudgeId: string) {
	console.log('Nudge dismissed:', nudgeId);
	return { success: true };
}
