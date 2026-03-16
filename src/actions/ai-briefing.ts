'use server';

import { and, asc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { conceptStruggles, topicConfidence, universityTargets } from '@/lib/db/schema';

export interface BriefingData {
	apsProgress: {
		currentAps: number;
		targetAps: number;
		pointsThisMonth: number;
		universityTarget?: string;
	};
	weakTopics: Array<{
		topic: string;
		subject: string;
		confidence: number;
	}>;
	streak: {
		currentStreak: number;
		hasStudiedToday: boolean;
	};
	greeting: string;
}

export async function generatePersonalizedBriefing(): Promise<BriefingData> {
	const auth = await getAuth();
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (!session?.user) {
		return getDefaultBriefing();
	}

	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return getDefaultBriefing();
	}

	const db = dbManager.getDb();

	try {
		const target = await db.query.universityTargets.findFirst({
			where: and(
				eq(universityTargets.userId, session.user.id),
				eq(universityTargets.isActive, true)
			),
		});

		const confidences = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, session.user.id),
			orderBy: [asc(topicConfidence.confidenceScore)],
			limit: 3,
		});

		const struggles = await db.query.conceptStruggles.findMany({
			where: and(
				eq(conceptStruggles.userId, session.user.id),
				eq(conceptStruggles.isResolved, false)
			),
		});

		const currentAps = 32;
		const targetAps = target?.targetAps || 42;
		const universityTarget = target?.universityName;
		const weakTopics = confidences.map((c) => ({
			topic: c.topic,
			subject: c.subject,
			confidence: Number(c.confidenceScore),
		}));
		const pointsThisMonth = struggles.length * 5;

		const greeting = generateGreeting({
			currentAps,
			targetAps,
			universityTarget,
			weakTopicsCount: weakTopics.length,
			struggleCount: struggles.length,
		});

		return {
			apsProgress: {
				currentAps,
				targetAps,
				pointsThisMonth,
				universityTarget,
			},
			weakTopics,
			streak: {
				currentStreak: pointsThisMonth > 0 ? Math.floor(pointsThisMonth / 10) : 0,
				hasStudiedToday: pointsThisMonth > 0,
			},
			greeting,
		};
	} catch (error) {
		console.error('Error generating personalized briefing:', error);
		return getDefaultBriefing();
	}
}

function generateGreeting(params: {
	currentAps: number;
	targetAps: number;
	universityTarget?: string;
	weakTopicsCount: number;
	struggleCount: number;
}): string {
	const { currentAps, targetAps, universityTarget, weakTopicsCount, struggleCount } = params;

	const apsGap = targetAps - currentAps;

	if (struggleCount === 0 && weakTopicsCount === 0) {
		return 'Ready to start your study journey? Your first step to reaching your university goals starts now!';
	}

	if (struggleCount > 0) {
		return `I noticed you've been working hard! You have ${struggleCount} concept${struggleCount > 1 ? 's' : ''} that need attention. Let's tackle them together!`;
	}

	if (weakTopicsCount > 0) {
		const topicText = weakTopicsCount === 1 ? 'one topic' : `${weakTopicsCount} topics`;
		return `Great progress! You have ${topicText} to review. Keep pushing toward your ${universityTarget || 'university'} goal - you're ${apsGap} points away!`;
	}

	if (currentAps >= targetAps) {
		return `Amazing! You've reached your APS target of ${targetAps}! You're ready for ${universityTarget || 'university'}!`;
	}

	return `You're making progress! Only ${apsGap} more points to reach your ${targetAps} APS goal for ${universityTarget || 'university'}!`;
}

function getDefaultBriefing(): BriefingData {
	return {
		apsProgress: {
			currentAps: 0,
			targetAps: 42,
			pointsThisMonth: 0,
		},
		weakTopics: [],
		streak: {
			currentStreak: 0,
			hasStudiedToday: false,
		},
		greeting: "Welcome to MatricMaster! Let's start your journey to university success!",
	};
}
