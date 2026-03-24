'use server';

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import {
	channelMembers,
	channels,
	leaderboardEntries,
	studyBuddies,
	studyBuddyProfiles,
	studyBuddyRequests,
	users,
} from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

export interface BuddyMatch {
	user: {
		id: string;
		name: string;
		personality: string;
	};
	compatibilityScore: number;
	complementaryTopics: { strong: string[]; weak: string[] };
}

export async function findBuddyMatches(limit = 10): Promise<BuddyMatch[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const myProfile = await db.query.studyBuddyProfiles.findFirst({
		where: eq(studyBuddyProfiles.userId, session.user.id),
	});

	if (!myProfile) return [];

	const potentialBuddies = await db.query.studyBuddyProfiles.findMany({
		where: and(
			eq(studyBuddyProfiles.isVisible, true),
			sql`${studyBuddyProfiles.userId} != ${session.user.id}`
		),
	});

	const myBuddies = await db.query.studyBuddies.findMany({
		where: sql`${studyBuddies.userId1} = ${session.user.id} OR ${studyBuddies.userId2} = ${session.user.id}`,
	});

	const existingBuddyIds = new Set(
		myBuddies.flatMap((b: typeof studyBuddies.$inferSelect) => [b.userId1, b.userId2])
	);

	const matches: BuddyMatch[] = [];

	for (const buddy of potentialBuddies) {
		if (existingBuddyIds.has(buddy.userId)) continue;

		const compatibilityScore = calculateCompatibility(myProfile, buddy);

		const complementaryTopics = findComplementaryTopics(myProfile, buddy);

		if (compatibilityScore > 50 || complementaryTopics.weak.length > 0) {
			const user = await db.query.users.findFirst({
				where: eq(users.id, buddy.userId),
			});

			matches.push({
				user: {
					id: buddy.userId,
					name: user?.name || 'Anonymous',
					personality: buddy.personality,
				},
				compatibilityScore,
				complementaryTopics,
			});
		}
	}

	return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, limit);
}

function calculateCompatibility(
	profile1: typeof studyBuddyProfiles.$inferSelect,
	profile2: typeof studyBuddyProfiles.$inferSelect
): number {
	let score = 0;

	const prefs1 = profile1.matchPreferences ? JSON.parse(profile1.matchPreferences) : {};
	const prefs2 = profile2.matchPreferences ? JSON.parse(profile2.matchPreferences) : {};

	if (profile1.personality === profile2.personality) {
		score += 20;
	} else {
		score += 10;
	}

	if (prefs1.preferredSubjects?.some((s: string) => prefs2.preferredSubjects?.includes(s))) {
		score += 30;
	}

	if (prefs1.studySchedule === prefs2.studySchedule) {
		score += 25;
	}

	return Math.min(100, score);
}

function findComplementaryTopics(
	profile1: typeof studyBuddyProfiles.$inferSelect,
	profile2: typeof studyBuddyProfiles.$inferSelect
): { strong: string[]; weak: string[] } {
	const subjects1 = profile1.preferredSubjects ? JSON.parse(profile1.preferredSubjects) : [];
	const subjects2 = profile2.preferredSubjects ? JSON.parse(profile2.preferredSubjects) : [];

	const strong1 = subjects1.filter((s: string) => !subjects2.includes(s));
	const strong2 = subjects2.filter((s: string) => !subjects1.includes(s));

	return {
		strong: strong1,
		weak: strong2,
	};
}

export async function sendBuddyRequest(toUserId: string, message?: string) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const existing = await db.query.studyBuddyRequests.findFirst({
		where: sql`
      (${studyBuddyRequests.requesterId} = ${session.user.id} AND ${studyBuddyRequests.recipientId} = ${toUserId})
      OR
      (${studyBuddyRequests.requesterId} = ${toUserId} AND ${studyBuddyRequests.recipientId} = ${session.user.id})
    `,
	});

	if (existing) throw new Error('Request already exists');

	const [request] = await db
		.insert(studyBuddyRequests)
		.values({
			requesterId: session.user.id,
			recipientId: toUserId,
			message,
		})
		.returning();

	return request;
}

export async function respondToBuddyRequest(requestId: string, accept: boolean) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const request = await db.query.studyBuddyRequests.findFirst({
		where: eq(studyBuddyRequests.id, requestId),
	});

	if (!request || request.recipientId !== session.user.id) {
		throw new Error('Request not found or unauthorized');
	}

	if (accept) {
		await db
			.update(studyBuddyRequests)
			.set({
				status: 'accepted',
				respondedAt: new Date(),
			})
			.where(eq(studyBuddyRequests.id, requestId));

		await db.insert(studyBuddies).values({
			userId1: request.requesterId,
			userId2: request.recipientId,
		});

		const myChannels = await db.query.channels.findMany({
			where: sql`${channels.id} IN (
        SELECT ${channelMembers.channelId} FROM ${channelMembers} WHERE ${channelMembers.userId} = ${session.user.id}
      )`,
		});

		const theirChannels = await db.query.channels.findMany({
			where: sql`${channels.id} IN (
        SELECT ${channelMembers.channelId} FROM ${channelMembers} WHERE ${channelMembers.userId} = ${request.requesterId}
      )`,
		});

		const mutualChannels = myChannels.filter((c: typeof channels.$inferSelect) =>
			theirChannels.some((tc: typeof channels.$inferSelect) => tc.id === c.id)
		);

		if (mutualChannels.length === 0) {
			const [channel] = await db
				.insert(channels)
				.values({
					name: 'Study Buddies',
					description: 'Auto-created study buddy channel',
					createdBy: session.user.id,
					isPublic: false,
					memberCount: 2,
				})
				.returning();

			await db.insert(channelMembers).values([
				{ channelId: channel.id, userId: session.user.id },
				{ channelId: channel.id, userId: request.requesterId },
			]);
		}
	} else {
		await db
			.update(studyBuddyRequests)
			.set({
				status: 'rejected',
				respondedAt: new Date(),
			})
			.where(eq(studyBuddyRequests.id, requestId));
	}
}

export async function getStudyGroupLeaderboard(groupId: string, periodType = 'weekly') {
	const db = await getDb();

	const members = await db.query.channelMembers.findMany({
		where: eq(channelMembers.channelId, groupId),
	});

	const memberIds = members.map((m: typeof channelMembers.$inferSelect) => m.userId);
	const periodStart = getPeriodStart(periodType);

	const leaderboard = await db.query.leaderboardEntries.findMany({
		where: and(
			sql`${leaderboardEntries.userId} IN ${memberIds}`,
			eq(leaderboardEntries.periodType, periodType),
			gte(leaderboardEntries.periodStart, periodStart)
		),
		orderBy: [desc(leaderboardEntries.totalPoints)],
		limit: 20,
	});

	return leaderboard;
}

function getPeriodStart(periodType: string): Date {
	const now = new Date();
	switch (periodType) {
		case 'daily':
			now.setHours(0, 0, 0, 0);
			break;
		case 'weekly':
			now.setDate(now.getDate() - now.getDay());
			now.setHours(0, 0, 0, 0);
			break;
		case 'monthly':
			now.setDate(1);
			now.setHours(0, 0, 0, 0);
			break;
	}
	return now;
}
