import { desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureAuthenticated } from '@/lib/db/auth-utils';
import { studyBuddyProfiles, topicMastery, users } from '@/lib/db/schema';

export async function GET(request: Request) {
	try {
		const user = await ensureAuthenticated();
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId') || user.id;

		const db = await getDb();

		// Get user's weak areas (mastery < 70%)
		const userWeakAreas = await db
			.select({
				topic: topicMastery.topic,
				subjectId: topicMastery.subjectId,
				masteryLevel: topicMastery.masteryLevel,
			})
			.from(topicMastery)
			.where(sql`${topicMastery.userId} = ${userId} AND ${topicMastery.masteryLevel} < 70`)
			.orderBy(desc(topicMastery.lastPracticed));

		// Get discoverable buddies
		const discoverable = await db
			.select()
			.from(studyBuddyProfiles)
			.where(
				sql`${studyBuddyProfiles.userId} != ${userId} AND ${studyBuddyProfiles.isVisible} = true`
			)
			.limit(50);

		// For each buddy, get their strong areas (mastery >= 70%)
		const matches = await Promise.all(
			discoverable.map(async (buddy) => {
				const buddyStrongAreas = await db
					.select({
						topic: topicMastery.topic,
						subjectId: topicMastery.subjectId,
						masteryLevel: topicMastery.masteryLevel,
					})
					.from(topicMastery)
					.where(
						sql`${topicMastery.userId} = ${buddy.userId} AND ${topicMastery.masteryLevel} >= 70`
					)
					.orderBy(desc(topicMastery.masteryLevel))
					.limit(20);

				// Get user info
				const [buddyUser] = await db
					.select({ name: users.name, image: users.image })
					.from(users)
					.where(eq(users.id, buddy.userId))
					.limit(1);

				// Parse preferred subjects
				let subjects: string[] = [];
				if (buddy.preferredSubjects) {
					try {
						subjects =
							typeof buddy.preferredSubjects === 'string'
								? JSON.parse(buddy.preferredSubjects)
								: buddy.preferredSubjects;
					} catch {
						subjects = [];
					}
				}

				return {
					userId: buddy.userId,
					name: buddyUser?.name || 'Unknown User',
					image: buddyUser?.image || undefined,
					bio: buddy.bio || '',
					studyGoals: buddy.studyGoals || '',
					subjects,
					strongAreas: buddyStrongAreas.map((a) => ({
						topic: a.topic,
						subjectId: a.subjectId,
						masteryLevel: Number(a.masteryLevel),
					})),
				};
			})
		);

		return NextResponse.json({
			success: true,
			matches,
			userWeakAreas: userWeakAreas.map((a) => ({
				topic: a.topic,
				subjectId: a.subjectId,
				masteryLevel: Number(a.masteryLevel),
			})),
		});
	} catch (error) {
		console.error('Error fetching buddy matches:', error);
		return NextResponse.json({ success: false, error: 'Failed to fetch matches' }, { status: 500 });
	}
}
