'use server';

import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { getUserAchievements } from '@/lib/db/achievement-actions';
import { getStudyBuddyProfile } from '@/lib/db/buddy-actions';
import { getWeakTopicsForUser } from '@/lib/db/learning-loop-actions';
import { getUserProgressSummary } from '@/lib/db/progress-actions';
import { getSubjects } from '@/lib/db/queries/content';
import { getFlashcardsDueToday, getReviewStats } from '@/lib/db/review-queue-actions';
import { getStreakInfo } from '@/lib/db/streak-actions';
import { getXPLevel } from '@/services/xpSystem';

export interface UnifiedStats {
	streak: {
		currentStreak: number;
		bestStreak: number;
		multiplier: number;
		multiplierLabel: string;
	};
	subjectMastery: Array<{
		subject: string;
		slug: string;
		masteryPercent: number;
	}>;
	flashcards: {
		dueToday: number;
		memorizationRate: number;
		totalReviews: number;
		streakDays: number;
		masteredCards: number;
		learningCards: number;
	};
	tutoring: {
		hasProfile: boolean;
	};
	weakTopics: Array<{
		topic: string;
		masteryLevel: number;
		subjectId: number;
	}>;
	achievements: {
		unlocked: number;
		total: number;
	};
	progress: {
		totalQuestionsAttempted: number;
		totalCorrect: number;
		accuracy: number;
		totalMarksEarned: number;
	};
	level: {
		level: number;
		xp: number;
		xpToNextLevel: number;
		title: string;
		progressPercent: number;
	};
	readinessScore: number;
}

async function getDbUserId(): Promise<string | null> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session?.user?.id ?? null;
}

export async function getUnifiedUserStats(): Promise<UnifiedStats> {
	const userId = await getDbUserId();

	const [
		streakInfo,
		subjects,
		reviewStats,
		dueToday,
		buddyProfile,
		weakTopics,
		achievements,
		progressSummary,
	] = await Promise.all([
		getStreakInfo(),
		getSubjects(),
		userId ? getReviewStats(userId) : Promise.resolve(null),
		userId ? getFlashcardsDueToday(userId) : Promise.resolve([]),
		userId ? getStudyBuddyProfile(userId) : Promise.resolve(null),
		userId ? getWeakTopicsForUser() : Promise.resolve([]),
		getUserAchievements(),
		getUserProgressSummary(),
	]);

	const subjectMastery = calculateSubjectMastery(subjects, progressSummary);

	const readinessScore = calculateReadinessScore({
		streak: streakInfo,
		reviewStats,
		progressSummary,
	});

	const totalXp = progressSummary?.totalMarksEarned ?? 0;
	const level = await getXPLevel(totalXp);

	return {
		streak: {
			currentStreak: streakInfo?.currentStreak ?? 0,
			bestStreak: streakInfo?.bestStreak ?? 0,
			multiplier: streakInfo?.multiplier ?? 1,
			multiplierLabel: streakInfo?.multiplierLabel ?? 'Base',
		},
		subjectMastery,
		flashcards: {
			dueToday: dueToday?.length ?? 0,
			memorizationRate: reviewStats
				? Math.round(
						reviewStats.totalReviews > 0
							? (reviewStats.correctToday / reviewStats.totalReviews) * 100
							: 0
					)
				: 0,
			totalReviews: reviewStats?.totalReviews ?? 0,
			streakDays: reviewStats?.streakDays ?? 0,
			masteredCards: reviewStats?.masteredCards ?? 0,
			learningCards: reviewStats?.learningCards ?? 0,
		},
		tutoring: {
			hasProfile: !!buddyProfile,
		},
		weakTopics: weakTopics ?? [],
		achievements: {
			unlocked: achievements.unlocked.length,
			total: achievements.available.length + achievements.unlocked.length,
		},
		progress: {
			totalQuestionsAttempted: progressSummary?.totalQuestionsAttempted ?? 0,
			totalCorrect: progressSummary?.totalCorrect ?? 0,
			accuracy: progressSummary?.accuracy ?? 0,
			totalMarksEarned: progressSummary?.totalMarksEarned ?? 0,
		},
		level: {
			level: level.level,
			xp: totalXp,
			xpToNextLevel: level.xpToNext,
			title: level.title,
			progressPercent: level.progressPercent,
		},
		readinessScore,
	};
}

function calculateSubjectMastery(
	subjects: unknown,
	progressSummary: { totalQuestionsAttempted: number; totalCorrect: number } | null
): UnifiedStats['subjectMastery'] {
	const total = progressSummary?.totalQuestionsAttempted ?? 0;
	const correct = progressSummary?.totalCorrect ?? 0;
	const baseAccuracy = total > 0 ? (correct / total) * 100 : 0;

	const subjectsArray = subjects as {
		id?: string;
		displayName?: string;
		slug?: string;
		name?: string;
	}[];
	const allSubjects = subjectsArray.slice(0, 8);
	const mastery: UnifiedStats['subjectMastery'] = [];

	for (const subject of allSubjects) {
		const subjectSlug = subject.slug ?? subject.id ?? '';
		const subjectName = subject.name ?? subject.displayName ?? '';
		mastery.push({
			subject: subjectName,
			slug: subjectSlug,
			masteryPercent: Math.round(baseAccuracy),
		});
	}

	return mastery;
}

function calculateReadinessScore({
	streak,
	reviewStats,
	progressSummary,
}: {
	streak: Awaited<ReturnType<typeof getStreakInfo>>;
	reviewStats: Awaited<ReturnType<typeof getReviewStats>> | null;
	progressSummary: Awaited<ReturnType<typeof getUserProgressSummary>> | null;
}): number {
	const streakScore = Math.min((streak?.currentStreak ?? 0) / 30, 1) * 100;

	const accuracy = progressSummary?.accuracy ?? 0;
	const subjectScore = accuracy;

	const reviewCount = reviewStats?.todayReviews ?? 0;
	const flashcardScore = Math.min(reviewCount / 10, 1) * 100;

	const readiness = streakScore * 0.3 + subjectScore * 0.4 + flashcardScore * 0.3;

	return Math.round(Math.min(readiness, 100));
}
