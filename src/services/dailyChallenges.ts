'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import {
	dailyChallenges,
	flashcardReviews,
	quizResults,
	studySessions,
	userProgress,
} from '@/lib/db/schema';
import { awardXP } from './xpSystem';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface DailyChallenge {
	id: string;
	title: string;
	description: string;
	type: 'quiz' | 'flashcard' | 'study' | 'streak';
	target: number;
	current: number;
	xpReward: number;
	expiresAt: Date;
	isCompleted: boolean;
	isClaimed: boolean;
}

interface ChallengeTemplate {
	type: 'quiz' | 'flashcard' | 'study' | 'streak';
	titles: string[];
	descriptions: string[];
	targets: number[];
	xpRewards: number[];
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
	{
		type: 'quiz',
		titles: ['Quiz Sprint', 'Quiz Master', 'Quick Thinker', 'Quiz Champion'],
		descriptions: [
			'Complete {target} quizzes today',
			'Score 80%+ on any quiz today',
			'Answer {target} quiz questions correctly',
			'Finish {target} quizzes with 70%+ accuracy',
		],
		targets: [3, 5, 10, 8],
		xpRewards: [30, 50, 75, 60],
	},
	{
		type: 'flashcard',
		titles: ['Flash Frenzy', 'Card Crusher', 'Memory Builder', 'Flashcard Pro'],
		descriptions: [
			'Review {target} flashcards today',
			'Master {target} flashcards with perfect recall',
			'Complete {target} flashcard reviews',
			'Review flashcards from {target} different decks',
		],
		targets: [15, 25, 40, 3],
		xpRewards: [25, 40, 60, 35],
	},
	{
		type: 'study',
		titles: ['Study Marathon', 'Focused Learner', 'Deep Study', 'Study Warrior'],
		descriptions: [
			'Study for {target} minutes today',
			'Complete {target} study sessions',
			'Study across {target} different subjects',
			'Achieve {target} minutes of focused study',
		],
		targets: [30, 3, 2, 60],
		xpRewards: [40, 35, 45, 70],
	},
	{
		type: 'streak',
		titles: ['Streak Keeper', 'Daily Dedication', 'Consistency King', 'Unstoppable'],
		descriptions: [
			'Maintain your study streak',
			'Log in and study for {target} consecutive days',
			'Study at least once every day for {target} days',
			'Keep your streak alive for {target} days',
		],
		targets: [1, 3, 5, 7],
		xpRewards: [20, 45, 65, 100],
	},
];

function getTomorrowMidnight(): Date {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(23, 59, 59, 999);
	return tomorrow;
}

function selectChallenges(seed: number): { template: ChallengeTemplate; variant: number }[] {
	const selected: { template: ChallengeTemplate; variant: number }[] = [];
	const usedTypes = new Set<string>();
	let currentSeed = seed;

	while (selected.length < 3) {
		const idx = (currentSeed + selected.length * 7) % CHALLENGE_TEMPLATES.length;
		const template = CHALLENGE_TEMPLATES[idx];
		if (!usedTypes.has(template.type)) {
			usedTypes.add(template.type);
			const variant = (currentSeed + selected.length) % template.titles.length;
			selected.push({ template, variant });
		}
		currentSeed = (currentSeed + 1) % CHALLENGE_TEMPLATES.length;
	}

	return selected;
}

export async function generateDailyChallenges(userId: string): Promise<DailyChallenge[]> {
	const db = await getDb();
	const expiresAt = getTomorrowMidnight();

	const existing = await db.query.dailyChallenges.findMany({
		where: and(eq(dailyChallenges.userId, userId), gte(dailyChallenges.expiresAt, new Date())),
	});

	if (existing.length >= 3) {
		return existing.map(mapDbChallengeToInterface);
	}

	// Clean up expired challenges
	await db
		.delete(dailyChallenges)
		.where(and(eq(dailyChallenges.userId, userId), sql`${dailyChallenges.expiresAt} < NOW()`));

	const daySeed = new Date().getDate() + new Date().getMonth() * 31 + userId.charCodeAt(0);
	const selections = selectChallenges(daySeed);

	const progress = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});
	const currentStreak = progress?.streakDays || 0;

	const challenges: DailyChallenge[] = [];

	for (const { template, variant } of selections) {
		const target = template.targets[variant];
		let current = 0;

		// Pre-fill progress from today's activities
		if (template.type === 'quiz') {
			const todayQuizzes = await db.query.quizResults.findMany({
				where: and(
					eq(quizResults.userId, userId),
					gte(quizResults.completedAt, new Date(new Date().setHours(0, 0, 0, 0)))
				),
			});
			current = todayQuizzes.length;
		} else if (template.type === 'flashcard') {
			const todayReviews = await db.query.flashcardReviews.findMany({
				where: and(
					eq(flashcardReviews.userId, userId),
					gte(flashcardReviews.reviewedAt, new Date(new Date().setHours(0, 0, 0, 0)))
				),
			});
			current = todayReviews.length;
		} else if (template.type === 'study') {
			const todaySessions = await db.query.studySessions.findMany({
				where: and(
					eq(studySessions.userId, userId),
					gte(studySessions.startedAt, new Date(new Date().setHours(0, 0, 0, 0)))
				),
			});
			current = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
		} else if (template.type === 'streak') {
			current = currentStreak;
		}

		const isCompleted = current >= target;

		const [inserted] = await db
			.insert(dailyChallenges)
			.values({
				userId,
				title: template.titles[variant],
				description: template.descriptions[variant].replace('{target}', String(target)),
				challengeType: template.type,
				target,
				currentProgress: Math.min(current, target),
				xpReward: template.xpRewards[variant],
				expiresAt,
				isCompleted,
			})
			.returning();

		challenges.push(mapDbChallengeToInterface(inserted));
	}

	return challenges;
}

export async function getTodayChallenges(): Promise<DailyChallenge[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return [];

	const db = await getDb();
	const userId = session.user.id;

	const existing = await db.query.dailyChallenges.findMany({
		where: and(eq(dailyChallenges.userId, userId), gte(dailyChallenges.expiresAt, new Date())),
		orderBy: [dailyChallenges.createdAt],
	});

	if (existing.length >= 3) {
		return existing.map(mapDbChallengeToInterface);
	}

	return generateDailyChallenges(userId);
}

export async function updateChallengeProgress(
	userId: string,
	challengeType: 'quiz' | 'flashcard' | 'study' | 'streak',
	progressDelta: number
): Promise<DailyChallenge[]> {
	const db = await getDb();

	const challenges = await db.query.dailyChallenges.findMany({
		where: and(
			eq(dailyChallenges.userId, userId),
			eq(dailyChallenges.challengeType, challengeType),
			gte(dailyChallenges.expiresAt, new Date()),
			eq(dailyChallenges.isCompleted, false)
		),
	});

	const updated: DailyChallenge[] = [];

	for (const challenge of challenges) {
		const newProgress = Math.min(challenge.currentProgress + progressDelta, challenge.target);
		const isCompleted = newProgress >= challenge.target;

		const [updatedChallenge] = await db
			.update(dailyChallenges)
			.set({
				currentProgress: newProgress,
				isCompleted,
				completedAt: isCompleted ? new Date() : undefined,
			})
			.where(eq(dailyChallenges.id, challenge.id))
			.returning();

		updated.push(mapDbChallengeToInterface(updatedChallenge));
	}

	return updated;
}

export async function claimChallengeReward(
	challengeId: string
): Promise<{ xp: number; badge?: string }> {
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error('Unauthorized');
	const userId = session.user.id;

	const db = await getDb();

	const challenge = await db.query.dailyChallenges.findFirst({
		where: eq(dailyChallenges.id, challengeId),
	});

	if (!challenge?.isCompleted || challenge.isClaimed || challenge.userId !== userId) {
		throw new Error('Challenge not claimable');
	}

	await db
		.update(dailyChallenges)
		.set({
			isClaimed: true,
			claimedAt: new Date(),
		})
		.where(eq(dailyChallenges.id, challengeId));

	await awardXP(userId, challenge.xpReward, `Daily challenge: ${challenge.title}`);

	return {
		xp: challenge.xpReward,
		badge: challenge.badgeId || undefined,
	};
}

function mapDbChallengeToInterface(challenge: typeof dailyChallenges.$inferSelect): DailyChallenge {
	return {
		id: challenge.id,
		title: challenge.title,
		description: challenge.description,
		type: challenge.challengeType as DailyChallenge['type'],
		target: challenge.target,
		current: challenge.currentProgress,
		xpReward: challenge.xpReward,
		expiresAt: challenge.expiresAt,
		isCompleted: challenge.isCompleted,
		isClaimed: challenge.isClaimed,
	};
}
