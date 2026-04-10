import { and, desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureAuthenticated } from '@/lib/db/auth-utils';
import { studyBuddyProfiles, topicMastery, users } from '@/lib/db/schema';

interface BuddyMatch {
	userId: string;
	name: string;
	image?: string;
	bio: string;
	studyGoals: string;
	subjects: string[];
	strongAreas: { topic: string; subjectId: number; masteryLevel: number }[];
	personality: string;
	lookingFor: string | null;
	matchScore: number;
	matchBreakdown: {
		subjectMatch: number;
		topicHelpYou: number;
		youCanHelpTopic: number;
		goalsAlignment: number;
		personalityCompat: number;
	};
	weakAreasYouCanHelp: string[];
	weakAreasTheyCanHelp: string[];
}

function calculatePersonalityScore(p1: string, p2: string): number {
	const scores: Record<string, Record<string, number>> = {
		mentor: { learner: 10, balanced: 5, mentor: 3 },
		learner: { mentor: 10, balanced: 5, learner: 3 },
		balanced: { mentor: 5, learner: 5, balanced: 8 },
	};
	return scores[p1]?.[p2] ?? 3;
}

function calculateGoalsAlignment(goals1: string, goals2: string): number {
	if (!goals1 || !goals2) return 0;
	const keywords1 = goals1.toLowerCase().split(/\s+/).filter(Boolean);
	const keywords2 = goals2.toLowerCase().split(/\s+/).filter(Boolean);
	const overlap = keywords1.filter((k) => keywords2.includes(k)).length;
	return Math.min(overlap * 5, 15);
}

function calculateSubjectMatch(userSubjects: string[], buddySubjects: string[]): number {
	if (!userSubjects.length || !buddySubjects.length) return 0;
	const userSubjectSet = new Set(userSubjects.map((s) => s.toLowerCase()));
	const buddySubjectSet = new Set(buddySubjects.map((s) => s.toLowerCase()));
	const intersection = [...userSubjectSet].filter((s) => buddySubjectSet.has(s));
	return Math.min(intersection.length * 30, 60);
}

export async function GET(request: Request) {
	try {
		const user = await ensureAuthenticated();
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId') || user.id;

		const db = await getDb();

		const [myProfile] = await db
			.select({
				bio: studyBuddyProfiles.bio,
				studyGoals: studyBuddyProfiles.studyGoals,
				preferredSubjects: studyBuddyProfiles.preferredSubjects,
				personality: studyBuddyProfiles.personality,
				lookingFor: studyBuddyProfiles.lookingFor,
			})
			.from(studyBuddyProfiles)
			.where(eq(studyBuddyProfiles.userId, userId))
			.limit(1);

		let mySubjects: string[] = [];
		if (myProfile?.preferredSubjects) {
			try {
				mySubjects =
					typeof myProfile.preferredSubjects === 'string'
						? JSON.parse(myProfile.preferredSubjects)
						: myProfile.preferredSubjects;
			} catch {
				mySubjects = [];
			}
		}

		const userWeakAreas = await db
			.select({
				topic: topicMastery.topic,
				subjectId: topicMastery.subjectId,
				masteryLevel: topicMastery.masteryLevel,
			})
			.from(topicMastery)
			.where(sql`${topicMastery.userId} = ${userId} AND ${topicMastery.masteryLevel} < 70`)
			.orderBy(desc(topicMastery.lastPracticed));

		const userStrongAreas = await db
			.select({
				topic: topicMastery.topic,
				subjectId: topicMastery.subjectId,
				masteryLevel: topicMastery.masteryLevel,
			})
			.from(topicMastery)
			.where(sql`${topicMastery.userId} = ${userId} AND ${topicMastery.masteryLevel} >= 70`)
			.limit(20);

		const discoverable = await db
			.select()
			.from(studyBuddyProfiles)
			.where(
				and(
					sql`${studyBuddyProfiles.userId} != ${userId}`,
					sql`${studyBuddyProfiles.isVisible} = true`
				)
			)
			.limit(50);

		const matches: BuddyMatch[] = await Promise.all(
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

				const [buddyUser] = await db
					.select({ name: users.name, image: users.image })
					.from(users)
					.where(eq(users.id, buddy.userId))
					.limit(1);

				let buddySubjects: string[] = [];
				if (buddy.preferredSubjects) {
					try {
						buddySubjects =
							typeof buddy.preferredSubjects === 'string'
								? JSON.parse(buddy.preferredSubjects)
								: buddy.preferredSubjects;
					} catch {
						buddySubjects = [];
					}
				}

				const weakAreasTheyCanHelp = userWeakAreas
					.filter((weak) =>
						buddyStrongAreas.some(
							(strong) => strong.topic === weak.topic && Number(strong.masteryLevel) >= 70
						)
					)
					.map((w) => w.topic);

				const weakAreasYouCanHelp = userStrongAreas
					.filter((strong) =>
						buddyStrongAreas.some(
							(buddyStrong) =>
								buddyStrong.topic === strong.topic && Number(buddyStrong.masteryLevel) >= 70
						)
					)
					.map((s) => s.topic);

				const subjectMatch = calculateSubjectMatch(mySubjects, buddySubjects);
				const topicHelpYou = weakAreasTheyCanHelp.length * 20;
				const youCanHelpTopic = weakAreasYouCanHelp.length * 10;
				const goalsAlignment = calculateGoalsAlignment(
					myProfile?.studyGoals || '',
					buddy.studyGoals || ''
				);
				const personalityCompat = calculatePersonalityScore(
					myProfile?.personality || 'balanced',
					buddy.personality || 'balanced'
				);

				const matchScore =
					subjectMatch + topicHelpYou + youCanHelpTopic + goalsAlignment + personalityCompat;

				return {
					userId: buddy.userId,
					name: buddyUser?.name || 'Unknown User',
					image: buddyUser?.image || undefined,
					bio: buddy.bio || '',
					studyGoals: buddy.studyGoals || '',
					subjects: buddySubjects,
					strongAreas: buddyStrongAreas.map((a) => ({
						topic: a.topic,
						subjectId: Number(a.subjectId),
						masteryLevel: Number(a.masteryLevel),
					})),
					personality: buddy.personality || 'balanced',
					lookingFor: buddy.lookingFor || null,
					matchScore,
					matchBreakdown: {
						subjectMatch,
						topicHelpYou,
						youCanHelpTopic,
						goalsAlignment,
						personalityCompat,
					},
					weakAreasYouCanHelp,
					weakAreasTheyCanHelp,
				};
			})
		);

		const sortedMatches = matches
			.filter((m) => m.matchScore > 0)
			.sort((a, b) => b.matchScore - a.matchScore);

		return NextResponse.json({
			success: true,
			matches: sortedMatches,
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
