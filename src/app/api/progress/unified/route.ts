import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { getUserStreak } from '@/lib/db/progress-actions';
import {
	flashcardDecks,
	flashcardReviews,
	flashcards,
	quizResults,
	studyPlans,
	studySessions,
	topicMastery,
} from '@/lib/db/schema';
import { getGlobalProgress } from '@/services/progressService';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export interface UnifiedProgress {
	summary: {
		totalXp: number;
		level: number;
		streak: number;
		bestStreak: number;
		hasRealData: boolean;
	};
	aiTutor: {
		topicsStudied: number;
		conversationsCount: number;
		totalSessionTime: number;
		recentConversations: Array<{
			id: string;
			topic: string;
			createdAt: Date | null;
		}>;
	};
	flashcards: {
		totalCards: number;
		masteredCards: number;
		dueForReview: number;
		decksCompleted: number;
		cardsLearned: number;
		reviewsToday: number;
	};
	quiz: {
		questionsAttempted: number;
		correctAnswers: number;
		averageScore: number;
		quizzesTaken: number;
		topicScores: Record<string, number>;
		recentQuizzes: Array<{
			topic: string;
			score: number;
			totalQuestions: number;
			completedAt: Date;
		}>;
	};
	studyPlan: {
		completionPercentage: number;
		tasksCompleted: number;
		tasksTotal: number;
		activePlans: number;
		recentPlans: Array<{
			id: string;
			title: string;
			progress: number;
		}>;
	};
	calendar: {
		sessionsScheduled: number;
		sessionsCompleted: number;
		attendanceRate: number;
		totalStudyMinutes: number;
		recentSessions: Array<{
			topic: string;
			durationMinutes: number;
			completedAt: Date | null;
		}>;
	};
	weakTopics: Array<{
		topicId: string;
		topicName: string;
		subject: string;
		masteryLevel: number;
		recommendation: string;
	}>;
}

async function getAiTutorProgress(userId: string) {
	const db = await getDb();

	const sessionsWithAiTutor = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), eq(studySessions.sessionType, 'ai_tutor')),
	});

	const uniqueTopics = new Set(
		sessionsWithAiTutor.map((s) => s.topic).filter((t): t is string => !!t)
	);
	const totalSessionTime = sessionsWithAiTutor.reduce(
		(sum, s) => sum + (s.durationMinutes || 0),
		0
	);

	const recentSessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), eq(studySessions.sessionType, 'ai_tutor')),
		orderBy: [desc(studySessions.completedAt)],
		limit: 5,
	});

	return {
		topicsStudied: uniqueTopics.size,
		conversationsCount: sessionsWithAiTutor.length,
		totalSessionTime,
		recentConversations: recentSessions.map((c) => ({
			id: c.id,
			topic: c.topic || 'General',
			createdAt: c.completedAt || c.startedAt,
		})),
	};
}

async function getFlashcardProgress(userId: string) {
	const db = await getDb();

	const decks = await db.query.flashcardDecks.findMany({
		where: eq(flashcardDecks.userId, userId),
	});

	const deckIds = decks.map((d) => d.id);

	let totalCards = 0;
	let masteredCards = 0;
	let dueForReview = 0;

	if (deckIds.length > 0) {
		const cards = await db.query.flashcards.findMany({
			where: sql`${flashcards.deckId} IN ${deckIds}`,
		});

		totalCards = cards.length;
		masteredCards = cards.filter((c) => Number(c.intervalDays) >= 21).length;
		dueForReview = cards.filter((c) => c.nextReview && new Date(c.nextReview) <= new Date()).length;
	}

	const completedDecks = decks.length;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const reviewsToday = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(flashcardReviews)
		.where(and(eq(flashcardReviews.userId, userId), gte(flashcardReviews.reviewedAt, today)));

	const cardsLearned = await db
		.select({ count: sql<number>`COUNT(DISTINCT ${flashcardReviews.flashcardId})` })
		.from(flashcardReviews)
		.where(eq(flashcardReviews.userId, userId));

	return {
		totalCards,
		masteredCards,
		dueForReview,
		decksCompleted: completedDecks,
		cardsLearned: cardsLearned[0]?.count || 0,
		reviewsToday: reviewsToday[0]?.count || 0,
	};
}

async function getQuizProgress(userId: string) {
	const db = await getDb();

	const quizResultsData = await db.query.quizResults.findMany({
		where: eq(quizResults.userId, userId),
		orderBy: [desc(quizResults.completedAt)],
		limit: 20,
	});

	const questionsAttempted = quizResultsData.reduce((sum, q) => sum + q.totalQuestions, 0);
	const correctAnswers = quizResultsData.reduce((sum, q) => sum + q.score, 0);
	const averageScore =
		quizResultsData.length > 0
			? Math.round(
					quizResultsData.reduce((sum, q) => sum + Number.parseFloat(q.percentage), 0) /
						quizResultsData.length
				)
			: 0;

	const topicScoresMap: Record<string, number[]> = {};
	for (const quiz of quizResultsData) {
		const topic = quiz.topic || 'General';
		if (!topicScoresMap[topic]) {
			topicScoresMap[topic] = [];
		}
		topicScoresMap[topic].push(Number.parseFloat(quiz.percentage));
	}

	const topicScores: Record<string, number> = {};
	for (const [topic, scores] of Object.entries(topicScoresMap)) {
		topicScores[topic] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
	}

	return {
		questionsAttempted,
		correctAnswers,
		averageScore,
		quizzesTaken: quizResultsData.length,
		topicScores,
		recentQuizzes: quizResultsData.slice(0, 5).map((q) => ({
			topic: q.topic || 'General',
			score: q.score,
			totalQuestions: q.totalQuestions,
			completedAt: q.completedAt,
		})),
	};
}

async function getStudyPlanProgress(userId: string) {
	const db = await getDb();

	const plans = await db.query.studyPlans.findMany({
		where: eq(studyPlans.userId, userId),
		orderBy: [desc(studyPlans.createdAt)],
	});

	const focusAreasCount = plans.reduce((sum, p) => {
		const areas = p.focusAreas ? JSON.parse(p.focusAreas) : [];
		return sum + areas.length;
	}, 0);

	const completedAreas = plans.reduce((sum, p) => {
		const areas = p.focusAreas ? JSON.parse(p.focusAreas) : [];
		return sum + areas.filter((a: { priority?: string }) => a.priority === 'completed').length;
	}, 0);

	const completionPercentage =
		focusAreasCount > 0 ? Math.round((completedAreas / focusAreasCount) * 100) : 0;

	const activePlans = plans.filter((p) => p.isActive).length;

	return {
		completionPercentage,
		tasksCompleted: completedAreas,
		tasksTotal: focusAreasCount,
		activePlans,
		recentPlans: plans.slice(0, 3).map((p) => ({
			id: p.id,
			title: p.title || 'Study Plan',
			progress: 0,
		})),
	};
}

async function getCalendarProgress(userId: string) {
	const db = await getDb();

	const sessions = await db.query.studySessions.findMany({
		where: eq(studySessions.userId, userId),
		orderBy: [desc(studySessions.completedAt)],
		limit: 30,
	});

	const sessionsCompleted = sessions.length;
	const totalStudyMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
	const attendanceRate = 100;

	return {
		sessionsScheduled: sessionsCompleted,
		sessionsCompleted,
		attendanceRate,
		totalStudyMinutes,
		recentSessions: sessions.slice(0, 5).map((s) => ({
			topic: s.topic || 'Study session',
			durationMinutes: s.durationMinutes || 0,
			completedAt: s.completedAt || s.startedAt,
		})),
	};
}

async function getWeakTopicsEnhanced(userId: string) {
	const db = await getDb();

	const weakTopics = await db.query.topicMastery.findMany({
		where: sql`${topicMastery.userId} = ${userId} AND ${topicMastery.masteryLevel} < 70`,
		orderBy: [sql`${topicMastery.masteryLevel} ASC`],
		limit: 10,
	});

	return weakTopics.map((topic) => ({
		topicId: `${topic.subjectId}-${topic.topic}`,
		topicName: topic.topic,
		subject: 'General',
		masteryLevel: Number(topic.masteryLevel),
		recommendation:
			Number(topic.masteryLevel) < 40
				? 'Focus on this topic today'
				: Number(topic.masteryLevel) < 60
					? 'Review with flashcards'
					: 'Keep practicing',
	}));
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized', success: false }, { status: 401 });
		}

		const userId = session.user.id;

		const [globalProgress, userStreak, aiTutor, flashcards, quiz, studyPlan, calendar, weakTopics] =
			await Promise.all([
				getGlobalProgress(userId),
				getUserStreak(),
				getAiTutorProgress(userId),
				getFlashcardProgress(userId),
				getQuizProgress(userId),
				getStudyPlanProgress(userId),
				getCalendarProgress(userId),
				getWeakTopicsEnhanced(userId),
			]);

		const hasRealData =
			(globalProgress && globalProgress.totalQuestionsAttempted > 0) ||
			(globalProgress && globalProgress.totalStudyTimeMinutes > 0) ||
			aiTutor.conversationsCount > 0 ||
			flashcards.totalCards > 0;

		const totalXp = globalProgress?.totalMarksEarned || 0;
		const level = Math.floor(totalXp / 500) + 1;

		const response: UnifiedProgress = {
			summary: {
				totalXp,
				level,
				streak: userStreak?.currentStreak || globalProgress?.streakDays || 0,
				bestStreak: userStreak?.bestStreak || globalProgress?.bestStreak || 0,
				hasRealData,
			},
			aiTutor,
			flashcards,
			quiz,
			studyPlan,
			calendar,
			weakTopics,
		};

		return NextResponse.json({
			success: true,
			...response,
		});
	} catch (error) {
		return handleApiError(error);
	}
}
