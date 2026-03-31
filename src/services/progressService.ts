'use server';

import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { type DbType, dbManager } from '@/lib/db';
import { ensureAuthenticated } from '@/lib/db/auth-utils';
import {
	flashcardDecks,
	flashcardReviews,
	flashcards,
	leaderboardEntries,
	pastPapers,
	quizResults,
	type StudySession,
	studyPlans,
	studySessions,
	subjects,
	topicMastery,
	userProgress,
} from '@/lib/db/schema';
import { calculateNextReview } from '@/lib/spaced-repetition';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface GlobalProgress {
	userId: string;
	totalQuestionsAttempted: number;
	totalCorrect: number;
	totalMarksEarned: number;
	accuracy: number;
	streakDays: number;
	bestStreak: number;
	flashcardsDue: number;
	weakTopicsCount: number;
	totalSessions: number;
	totalStudyTimeMinutes: number;
	recentSessions: StudySession[];
	subjectProgress: SubjectProgress[];
	weeklyPoints: number;
	monthlyRank: number | null;
}

export interface SubjectProgress {
	subjectId: number;
	subjectName: string;
	questionsAttempted: number;
	questionsCorrect: number;
	masteryLevel: number;
}

export interface WeakTopic {
	topic: string;
	subjectId: number;
	subjectName: string;
	masteryLevel: number;
	questionsAttempted: number;
	questionsCorrect: number;
	lastPracticed: Date | null;
}

export interface StudyStats {
	totalStudyTimeMinutes: number;
	avgSessionLength: number;
	questionsPerDay: number;
	correctRate: number;
	strongestTopic: string | null;
	weakestTopic: string | null;
	totalFlashcardsReviewed: number;
	avgFlashcardEase: number;
	papersAttempted: number;
	avgPaperScore: number;
	weeklyTrend: 'improving' | 'declining' | 'stable';
	streakDays: number;
	bestStreak: number;
}

export interface LessonCompletionResult {
	success: boolean;
	sessionId?: string;
	xpEarned?: number;
}

export interface QuizAttemptResult {
	success: boolean;
	sessionId?: string;
	xpEarned?: number;
	newAchievement?: string;
}

export interface PastPaperAttemptResult {
	success: boolean;
	sessionId?: string;
	xpEarned?: number;
}

export interface FlashcardReviewResult {
	success: boolean;
	nextReviewDays?: number;
	newEaseFactor?: number;
}

async function getUserId(): Promise<string> {
	const user = await ensureAuthenticated();
	return user.id;
}

export async function trackLessonCompletion(
	_lessonId: string,
	subjectId: number | undefined,
	topic: string
): Promise<LessonCompletionResult> {
	try {
		const userId = await getUserId();
		const db = await getDb();

		await db.insert(studySessions).values({
			userId,
			subjectId,
			sessionType: 'lesson',
			topic,
			durationMinutes: 0,
			questionsAttempted: 0,
			correctAnswers: 0,
			marksEarned: 10,
			startedAt: new Date(),
			completedAt: new Date(),
		});

		await updateUserProgressStats(userId, db, 0, 0, 10);

		return {
			success: true,
			xpEarned: 10,
		};
	} catch (error) {
		console.error('Error tracking lesson completion:', error);
		return { success: false };
	}
}

export async function trackQuizAttempt(
	quizId: string,
	subjectId: number | undefined,
	topic: string,
	score: number,
	totalQuestions: number,
	marksEarned: number,
	durationMinutes: number
): Promise<QuizAttemptResult> {
	try {
		const userId = await getUserId();
		const db = await getDb();

		const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

		await db.insert(quizResults).values({
			userId,
			quizId,
			score,
			totalQuestions,
			percentage: percentage.toFixed(2) as `${number}.${number}`,
			timeTaken: durationMinutes * 60,
			completedAt: new Date(),
		});

		await db.insert(studySessions).values({
			userId,
			subjectId,
			sessionType: 'quiz',
			topic,
			durationMinutes,
			questionsAttempted: totalQuestions,
			correctAnswers: score,
			marksEarned,
			startedAt: new Date(Date.now() - durationMinutes * 60 * 1000),
			completedAt: new Date(),
		});

		await updateTopicMastery(userId, subjectId, topic, score, totalQuestions, db);
		await updateUserProgressStats(userId, db, totalQuestions, score, marksEarned);
		await updateLeaderboard(userId, marksEarned, totalQuestions, db);

		return {
			success: true,
			xpEarned: marksEarned,
		};
	} catch (error) {
		console.error('Error tracking quiz attempt:', error);
		return { success: false };
	}
}

export async function trackPastPaperAttempt(
	paperId: string,
	subjectId: number | undefined,
	questionsAttempted: number,
	score: number,
	durationMinutes: number
): Promise<PastPaperAttemptResult> {
	try {
		const userId = await getUserId();
		const db = await getDb();

		await db.insert(studySessions).values({
			userId,
			subjectId,
			sessionType: 'past_paper',
			topic: paperId,
			durationMinutes,
			questionsAttempted,
			correctAnswers: 0,
			marksEarned: score,
			startedAt: new Date(Date.now() - durationMinutes * 60 * 1000),
			completedAt: new Date(),
		});

		await db
			.update(pastPapers)
			.set({ updatedAt: new Date() })
			.where(eq(pastPapers.paperId, paperId));

		await updateUserProgressStats(userId, db, questionsAttempted, 0, score);
		await updateLeaderboard(userId, score, questionsAttempted, db);

		return {
			success: true,
			xpEarned: score,
		};
	} catch (error) {
		console.error('Error tracking past paper attempt:', error);
		return { success: false };
	}
}

export async function trackFlashcardReview(
	flashcardId: string,
	rating: number
): Promise<FlashcardReviewResult> {
	try {
		const userId = await getUserId();
		const db = await getDb();

		const flashcard = await db.query.flashcards.findFirst({
			where: eq(flashcards.id, flashcardId),
		});

		if (!flashcard) {
			return { success: false };
		}

		const intervalBefore = flashcard.intervalDays;
		const easeFactorBefore = Number.parseFloat(flashcard.easeFactor as string);

		const result = calculateNextReview(
			intervalBefore,
			flashcard.repetitions,
			easeFactorBefore,
			rating as 1 | 2 | 3 | 4 | 5
		);

		await db
			.update(flashcards)
			.set({
				repetitions: result.repetitions,
				easeFactor: result.easeFactor.toFixed(2) as unknown as typeof flashcards.easeFactor,
				intervalDays: result.interval,
				nextReview: result.nextReview,
				lastReview: new Date(),
				timesReviewed: flashcard.timesReviewed + 1,
				timesCorrect: rating >= 3 ? flashcard.timesCorrect + 1 : flashcard.timesCorrect,
			})
			.where(eq(flashcards.id, flashcardId));

		await db.insert(flashcardReviews).values({
			userId,
			flashcardId,
			rating,
			intervalBefore,
			intervalAfter: result.interval,
			easeFactorBefore: easeFactorBefore.toFixed(2) as unknown as string,
			easeFactorAfter: result.easeFactor.toFixed(2) as unknown as string,
			reviewedAt: new Date(),
		});

		const xpEarned = Math.round(5 + (rating - 3) * 2);
		await updateUserProgressStats(userId, db, 1, rating >= 3 ? 1 : 0, xpEarned);

		return {
			success: true,
			nextReviewDays: result.interval,
			newEaseFactor: result.easeFactor,
		};
	} catch (error) {
		console.error('Error tracking flashcard review:', error);
		return { success: false };
	}
}

async function updateTopicMastery(
	userId: string,
	subjectId: number | undefined,
	topic: string,
	correct: number,
	total: number,
	db: DbType
): Promise<void> {
	if (!subjectId) return;

	const isCorrect = correct / total >= 0.6;

	const existing = await db.query.topicMastery.findFirst({
		where: and(
			eq(topicMastery.userId, userId),
			eq(topicMastery.subjectId, subjectId),
			eq(topicMastery.topic, topic)
		),
	});

	if (existing) {
		const newMastery = Math.min(
			100,
			Number(existing.masteryLevel) + (isCorrect ? 2 : -1) + (correct / total) * 5
		);

		await db
			.update(topicMastery)
			.set({
				masteryLevel: newMastery.toFixed(2) as unknown as typeof topicMastery.masteryLevel,
				questionsAttempted: existing.questionsAttempted + total,
				questionsCorrect: existing.questionsCorrect + correct,
				lastPracticed: new Date(),
				nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				consecutiveCorrect: isCorrect ? existing.consecutiveCorrect + 1 : 0,
				updatedAt: new Date(),
			})
			.where(eq(topicMastery.id, existing.id));
	} else {
		const initialMastery = Math.min(100, 10 + (correct / total) * 30);
		await db.insert(topicMastery).values({
			userId,
			subjectId,
			topic,
			masteryLevel: sql`${initialMastery.toFixed(2)}`,
			questionsAttempted: total,
			questionsCorrect: correct,
			lastPracticed: new Date(),
			nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});
	}
}

async function updateUserProgressStats(
	userId: string,
	db: DbType,
	questionsAttempted: number,
	correct: number,
	marksEarned: number
): Promise<void> {
	const existing = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	if (existing) {
		await db
			.update(userProgress)
			.set({
				totalQuestionsAttempted: existing.totalQuestionsAttempted + questionsAttempted,
				totalCorrect: existing.totalCorrect + correct,
				totalMarksEarned: existing.totalMarksEarned + marksEarned,
				lastActivityAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(userProgress.id, existing.id));
	} else {
		await db.insert(userProgress).values({
			userId,
			totalQuestionsAttempted: questionsAttempted,
			totalCorrect: correct,
			totalMarksEarned: marksEarned,
			streakDays: 1,
			bestStreak: 1,
		});
	}
}

async function updateLeaderboard(
	userId: string,
	points: number,
	questions: number,
	db: DbType
): Promise<void> {
	const now = new Date();
	const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

	const existing = await db.query.leaderboardEntries.findFirst({
		where: and(
			eq(leaderboardEntries.userId, userId),
			eq(leaderboardEntries.periodType, 'monthly'),
			eq(leaderboardEntries.periodStart, periodStart)
		),
	});

	if (existing) {
		await db
			.update(leaderboardEntries)
			.set({
				totalPoints: existing.totalPoints + points,
				questionsCompleted: existing.questionsCompleted + questions,
				updatedAt: new Date(),
			})
			.where(eq(leaderboardEntries.id, existing.id));
	} else {
		await db.insert(leaderboardEntries).values({
			userId,
			periodType: 'monthly',
			periodStart,
			totalPoints: points,
			questionsCompleted: questions,
		});
	}
}

export async function getGlobalProgress(userId?: string): Promise<GlobalProgress | null> {
	try {
		const targetUserId = userId || (await getUserId());
		const db = await getDb();

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, targetUserId),
		});

		const recentSessions = await db.query.studySessions.findMany({
			where: eq(studySessions.userId, targetUserId),
			orderBy: [desc(studySessions.completedAt)],
			limit: 10,
		});

		const totalStudyTime = await db
			.select({ total: sql<number>`COALESCE(SUM(${studySessions.durationMinutes}), 0)` })
			.from(studySessions)
			.where(eq(studySessions.userId, targetUserId));

		const flashcardsDueResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(flashcards)
			.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
			.where(and(eq(flashcardDecks.userId, targetUserId), lt(flashcards.nextReview, new Date())));

		const flashcardsDueCount = Number(flashcardsDueResult[0]?.count ?? 0);

		const weakTopics = await db.query.topicMastery.findMany({
			where: and(eq(topicMastery.userId, targetUserId), sql`${topicMastery.masteryLevel} < 60`),
		});

		const subjectProgressData = await db.query.topicMastery.findMany({
			where: eq(topicMastery.userId, targetUserId),
			orderBy: [desc(topicMastery.questionsAttempted)],
		});

		const subjectMap = new Map<number, SubjectProgress>();
		for (const tm of subjectProgressData) {
			const existing = subjectMap.get(Number(tm.subjectId));
			if (existing) {
				existing.questionsAttempted += tm.questionsAttempted;
				existing.questionsCorrect += tm.questionsCorrect;
				existing.masteryLevel = Math.max(existing.masteryLevel, Number(tm.masteryLevel));
			} else {
				subjectMap.set(Number(tm.subjectId), {
					subjectId: Number(tm.subjectId),
					subjectName: '',
					questionsAttempted: tm.questionsAttempted,
					questionsCorrect: tm.questionsCorrect,
					masteryLevel: Number(tm.masteryLevel),
				});
			}
		}

		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - 7);
		const weeklyPoints = await db
			.select({ total: sql<number>`COALESCE(SUM(${leaderboardEntries.totalPoints}), 0)` })
			.from(leaderboardEntries)
			.where(
				and(
					eq(leaderboardEntries.userId, targetUserId),
					eq(leaderboardEntries.periodType, 'monthly'),
					gte(leaderboardEntries.periodStart, weekStart)
				)
			);

		const currentMonth = new Date();
		const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
		const monthlyRankData = await db.query.leaderboardEntries.findFirst({
			where: and(
				eq(leaderboardEntries.userId, targetUserId),
				eq(leaderboardEntries.periodType, 'monthly'),
				eq(leaderboardEntries.periodStart, monthStart)
			),
		});

		let monthlyRank: number | null = null;
		if (monthlyRankData?.totalPoints) {
			const higherRankCount = await db
				.select({ count: sql<number>`COUNT(*)` })
				.from(leaderboardEntries)
				.where(
					and(
						eq(leaderboardEntries.periodType, 'monthly'),
						eq(leaderboardEntries.periodStart, monthStart),
						sql`${leaderboardEntries.totalPoints} > ${monthlyRankData.totalPoints}`
					)
				);
			monthlyRank = (higherRankCount[0]?.count ?? 0) + 1;
		}

		const subjectIds = Array.from(subjectMap.keys());
		if (subjectIds.length > 0) {
			const subjectsData = await db.query.subjects.findMany({
				where: sql`${subjects.id} = ANY(${subjectIds})`,
			});
			for (const subject of subjectsData) {
				const sp = subjectMap.get(Number(subject.id));
				if (sp) {
					sp.subjectName = subject.name;
				}
			}
		}

		const accuracy =
			progress && progress.totalQuestionsAttempted > 0
				? Math.round((progress.totalCorrect / progress.totalQuestionsAttempted) * 100)
				: 0;

		return {
			userId: targetUserId,
			totalQuestionsAttempted: progress?.totalQuestionsAttempted || 0,
			totalCorrect: progress?.totalCorrect || 0,
			totalMarksEarned: progress?.totalMarksEarned || 0,
			accuracy,
			streakDays: progress?.streakDays || 0,
			bestStreak: progress?.bestStreak || 0,
			flashcardsDue: flashcardsDueCount,
			weakTopicsCount: weakTopics.length,
			totalSessions: recentSessions.length,
			totalStudyTimeMinutes: totalStudyTime[0]?.total || 0,
			recentSessions,
			subjectProgress: Array.from(subjectMap.values()),
			weeklyPoints: weeklyPoints[0]?.total || 0,
			monthlyRank,
		};
	} catch (error) {
		console.error('Error getting global progress:', error);
		return null;
	}
}

export async function getWeakTopics(userId?: string, limit = 5): Promise<WeakTopic[]> {
	try {
		const targetUserId = userId || (await getUserId());
		const db = await getDb();

		const topics = await db.query.topicMastery.findMany({
			where: and(eq(topicMastery.userId, targetUserId), sql`${topicMastery.masteryLevel} < 70`),
			orderBy: [sql`${topicMastery.masteryLevel} ASC`],
			limit,
		});

		const subjectIds = [...new Set(topics.map((t) => Number(t.subjectId)))];
		const subjectsData =
			subjectIds.length > 0
				? await db.query.subjects.findMany({
						where: sql`${subjects.id} = ANY(${subjectIds})`,
					})
				: [];

		const subjectMap = new Map(subjectsData.map((s) => [Number(s.id), s.name]));

		return topics.map((t) => ({
			topic: t.topic,
			subjectId: Number(t.subjectId),
			subjectName: subjectMap.get(Number(t.subjectId)) || '',
			masteryLevel: Number(t.masteryLevel),
			questionsAttempted: t.questionsAttempted,
			questionsCorrect: t.questionsCorrect,
			lastPracticed: t.lastPracticed,
		}));
	} catch (error) {
		console.error('Error getting weak topics:', error);
		return [];
	}
}

export async function getStudyStats(userId?: string): Promise<StudyStats | null> {
	try {
		const targetUserId = userId || (await getUserId());
		const db = await getDb();

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, targetUserId),
		});

		const sessions = await db.query.studySessions.findMany({
			where: eq(studySessions.userId, targetUserId),
			orderBy: [desc(studySessions.startedAt)],
		});

		const totalStudyTime = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
		const avgSessionLength = sessions.length > 0 ? Math.round(totalStudyTime / sessions.length) : 0;

		const now = new Date();
		const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const questionsThisWeek = sessions
			.filter((s) => s.startedAt && s.startedAt >= weekAgo)
			.reduce((sum, s) => sum + s.questionsAttempted, 0);
		const questionsPerDay = Math.round(questionsThisWeek / 7);

		const allTopicMastery = await db.query.topicMastery.findMany({
			where: eq(topicMastery.userId, targetUserId),
		});

		let strongestTopic: string | null = null;
		let weakestTopic: string | null = null;
		let highestMastery = 0;
		let lowestMastery = 100;

		for (const tm of allTopicMastery) {
			const mastery = Number(tm.masteryLevel);
			if (mastery > highestMastery) {
				highestMastery = mastery;
				strongestTopic = tm.topic;
			}
			if (mastery < lowestMastery) {
				lowestMastery = mastery;
				weakestTopic = tm.topic;
			}
		}

		const flashcardStats = await db
			.select({
				totalReviewed: sql<number>`COUNT(*)`,
				avgEase: sql<number>`AVG(${flashcards.easeFactor})`,
			})
			.from(flashcards)
			.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
			.where(eq(flashcardDecks.userId, targetUserId));

		const paperAttempts = await db
			.select({ count: sql<number>`COUNT(DISTINCT ${studySessions.topic})` })
			.from(studySessions)
			.where(
				and(eq(studySessions.userId, targetUserId), eq(studySessions.sessionType, 'past_paper'))
			);

		const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
		const firstWeekSessions = sessions.filter(
			(s) => s.startedAt && s.startedAt >= twoWeeksAgo && s.startedAt < weekAgo
		);
		const secondWeekSessions = sessions.filter((s) => s.startedAt && s.startedAt >= weekAgo);

		const firstWeekCorrect =
			firstWeekSessions.reduce((sum, s) => sum + s.correctAnswers, 0) /
			Math.max(
				1,
				firstWeekSessions.reduce((sum, s) => sum + s.questionsAttempted, 0)
			);
		const secondWeekCorrect =
			secondWeekSessions.reduce((sum, s) => sum + s.correctAnswers, 0) /
			Math.max(
				1,
				secondWeekSessions.reduce((sum, s) => sum + s.questionsAttempted, 0)
			);

		let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';
		if (secondWeekCorrect > firstWeekCorrect + 0.05) {
			weeklyTrend = 'improving';
		} else if (secondWeekCorrect < firstWeekCorrect - 0.05) {
			weeklyTrend = 'declining';
		}

		return {
			totalStudyTimeMinutes: totalStudyTime,
			avgSessionLength,
			questionsPerDay,
			correctRate: progress
				? Math.round(
						(progress.totalQuestionsAttempted > 0
							? progress.totalCorrect / progress.totalQuestionsAttempted
							: 0) * 100
					)
				: 0,
			strongestTopic,
			weakestTopic,
			totalFlashcardsReviewed: flashcardStats[0]?.totalReviewed || 0,
			avgFlashcardEase: Number(flashcardStats[0]?.avgEase?.toFixed(2)) || 2.5,
			papersAttempted: paperAttempts[0]?.count || 0,
			avgPaperScore: 0,
			weeklyTrend,
			streakDays: progress?.streakDays || 0,
			bestStreak: progress?.bestStreak || 0,
		};
	} catch (error) {
		console.error('Error getting study stats:', error);
		return null;
	}
}

export interface QuizResultSummary {
	quizId: string;
	subjectId: number | undefined;
	topic: string;
	score: number;
	totalQuestions: number;
	correctCount: number;
	incorrectCount: number;
	weakTopics: string[];
	completedAt: Date;
}

export interface PlanAdaptation {
	planId: string;
	topic: string;
	subject: string;
	oldPriority: number;
	newPriority: number;
	reason: string;
	adaptedAt: Date;
}

export async function adjustStudyPlanBasedOnResults(
	planId: string,
	results: QuizResultSummary
): Promise<{ success: boolean; adaptations?: PlanAdaptation[]; error?: string }> {
	try {
		const userId = await getUserId();
		const db = await getDb();

		const plan = await db.query.studyPlans.findFirst({
			where: eq(studyPlans.id, planId),
		});

		if (!plan) {
			return { success: false, error: 'Study plan not found' };
		}

		const adaptations: PlanAdaptation[] = [];
		const weakTopics = results.weakTopics;

		for (const topic of weakTopics) {
			const topicMasteryRecord = await db.query.topicMastery.findFirst({
				where: and(eq(topicMastery.userId, userId), eq(topicMastery.topic, topic)),
			});

			const currentPriority = topicMasteryRecord
				? Math.max(1, 10 - Math.floor(Number(topicMasteryRecord.masteryLevel) / 10))
				: 8;
			const newPriority = Math.max(1, currentPriority - 2);

			adaptations.push({
				planId,
				topic,
				subject: '',
				oldPriority: currentPriority,
				newPriority,
				reason: `Weak performance in quiz (${results.correctCount}/${results.totalQuestions} correct)`,
				adaptedAt: new Date(),
			});
		}

		const existingFocusAreas = plan.focusAreas ? JSON.parse(plan.focusAreas) : [];
		const updatedFocusAreas = [
			...existingFocusAreas,
			...weakTopics.map((topic) => ({
				topic,
				priority: 'high',
				addedAt: new Date().toISOString(),
			})),
		];

		await db
			.update(studyPlans)
			.set({
				focusAreas: JSON.stringify(updatedFocusAreas),
				updatedAt: new Date(),
			})
			.where(eq(studyPlans.id, planId));

		return { success: true, adaptations };
	} catch (error) {
		console.error('Error adjusting study plan:', error);
		return { success: false, error: 'Failed to adjust study plan' };
	}
}

export async function getAdaptationHistory(planId: string): Promise<PlanAdaptation[]> {
	try {
		const db = await getDb();

		const plan = await db.query.studyPlans.findFirst({
			where: eq(studyPlans.id, planId),
		});

		if (!plan) {
			return [];
		}

		const focusAreas = plan.focusAreas ? JSON.parse(plan.focusAreas) : [];
		return focusAreas
			.filter((fa: { addedAt?: string }) => fa.addedAt)
			.map((fa: { topic: string; priority: string; addedAt?: string }) => ({
				planId,
				topic: fa.topic,
				subject: '',
				oldPriority: 5,
				newPriority: fa.priority === 'high' ? 8 : 5,
				reason: 'Automatically adjusted based on quiz performance',
				adaptedAt: new Date(fa.addedAt || ''),
			}));
	} catch (error) {
		console.error('Error getting adaptation history:', error);
		return [];
	}
}
