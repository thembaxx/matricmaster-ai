import { and, desc, eq, gte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import {
	calendarEvents,
	flashcardReviews,
	quizResults,
	studySessions,
	subjects,
	topicMastery,
	userProgress,
} from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return (await dbManager.getDb()) as DbType;
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const headersList = request.headers;
		const session = await auth.api.getSession({ headers: headersList as never });

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;

		const db = await getDb();

		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		// Fetch all data in PARALLEL upfront (eliminates N+1)
		const [
			progressData,
			masteryData,
			recentSessionsData,
			recentQuizzes,
			flashcardReviewsData,
			calendarData,
		] = await Promise.all([
			// Progress by subject
			db
				.select({
					subjectId: userProgress.subjectId,
					totalQuestions: userProgress.totalQuestionsAttempted,
					totalCorrect: userProgress.totalCorrect,
				})
				.from(userProgress)
				.innerJoin(subjects, eq(userProgress.subjectId, subjects.id))
				.where(eq(userProgress.userId, userId)),

			// All topic mastery data (single query)
			db
				.select({
					subjectId: topicMastery.subjectId,
					masteryLevel: topicMastery.masteryLevel,
					topicId: topicMastery.topicId,
				})
				.from(topicMastery)
				.where(eq(topicMastery.userId, userId)),

			// Recent study sessions
			db
				.select({
					id: studySessions.id,
					subjectId: studySessions.subjectId,
					durationMinutes: studySessions.durationMinutes,
					startedAt: studySessions.startedAt,
					completedAt: studySessions.completedAt,
				})
				.from(studySessions)
				.where(
					and(
						eq(studySessions.userId, userId),
						gte(studySessions.startedAt, thirtyDaysAgo),
						studySessions.completedAt
					)
				)
				.orderBy(desc(studySessions.startedAt)),

			// Recent quizzes
			db
				.select({
					id: quizResults.id,
					subjectId: quizResults.subjectId,
					score: quizResults.score,
					percentage: quizResults.percentage,
					completedAt: quizResults.completedAt,
				})
				.from(quizResults)
				.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, thirtyDaysAgo)))
				.orderBy(desc(quizResults.completedAt))
				.limit(20),

			// Flashcard reviews
			db
				.select({
					reviewedAt: flashcardReviews.reviewedAt,
				})
				.from(flashcardReviews)
				.where(
					and(eq(flashcardReviews.userId, userId), gte(flashcardReviews.reviewedAt, thirtyDaysAgo))
				),

			// Calendar events (exams)
			db
				.select()
				.from(calendarEvents)
				.where(
					and(
						eq(calendarEvents.userId, userId),
						eq(calendarEvents.eventType, 'exam'),
						gte(calendarEvents.startTime, new Date())
					)
				)
				.orderBy(calendarEvents.startTime)
				.limit(5),
		]);

		const totalHoursThisWeek =
			recentSessionsData
				.filter(
					(s: (typeof recentSessionsData)[number]) => new Date(s.startedAt || 0) >= sevenDaysAgo
				)
				.reduce(
					(sum: number, s: (typeof recentSessionsData)[number]) => sum + (s.durationMinutes || 0),
					0
				) / 60;

		const progress = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId))
			.limit(1)
			.then((rows) => rows[0]);

		const avgQuizScore =
			recentQuizzes.length > 0
				? Math.round(
						recentQuizzes.reduce(
							(sum: number, q: (typeof recentQuizzes)[number]) => sum + Number(q.percentage || 0),
							0
						) / recentQuizzes.length
					)
				: 0;

		const dailyMinutes = Array.from({ length: 7 }, (_, i) => {
			const dayStart = new Date(sevenDaysAgo);
			dayStart.setDate(dayStart.getDate() + i);
			const dayEnd = new Date(dayStart);
			dayEnd.setDate(dayEnd.getDate() + 1);
			return recentSessionsData
				.filter(
					(s: (typeof recentSessionsData)[number]) =>
						s.startedAt && new Date(s.startedAt) >= dayStart && new Date(s.startedAt) < dayEnd
				)
				.reduce(
					(sum: number, s: (typeof recentSessionsData)[number]) => sum + (s.durationMinutes || 0),
					0
				);
		});

		const flashcardStreak = (() => {
			let streak = 0;
			for (let i = 0; i < 30; i++) {
				const dayStart = new Date();
				dayStart.setDate(dayStart.getDate() - i);
				dayStart.setHours(0, 0, 0, 0);
				const dayEnd = new Date(dayStart);
				dayEnd.setDate(dayEnd.getDate() + 1);
				const hasReviews = flashcardReviewsData.some(
					(r: (typeof flashcardReviewsData)[number]) =>
						r.reviewedAt && new Date(r.reviewedAt) >= dayStart && new Date(r.reviewedAt) < dayEnd
				);
				if (hasReviews) {
					streak++;
				} else if (i > 0) {
					break;
				}
			}
			return streak;
		})();

		const quizScores = recentQuizzes.map((q: (typeof recentQuizzes)[number]) =>
			Number(q.percentage || 0)
		);

		// Build lookup maps for O(1) access (eliminates N+1 inside map)
		const masteryBySubject = new Map<number, typeof masteryData>();
		for (const m of masteryData) {
			const subjId = Number(m.subjectId);
			if (!masteryBySubject.has(subjId)) {
				masteryBySubject.set(subjId, []);
			}
			masteryBySubject.get(subjId)!.push(m);
		}

		const sessionsBySubject = new Map<number, typeof recentSessionsData>();
		for (const s of recentSessionsData) {
			const subjId = Number(s.subjectId);
			if (!sessionsBySubject.has(subjId)) {
				sessionsBySubject.set(subjId, []);
			}
			sessionsBySubject.get(subjId)!.push(s);
		}

		const subjectPerformance = progressData.map((p) => {
			const subjId = Number(p.subjectId);
			const totalAttempted = p.totalQuestions || 0;
			const totalCorrect = p.totalCorrect || 0;
			const score = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

			const subjectMastery = masteryBySubject.get(subjId) || [];
			const avgConfidence =
				subjectMastery.length > 0
					? subjectMastery.reduce((sum, m) => sum + Number(m.masteryLevel), 0) /
						subjectMastery.length /
						100
					: 0;

			const mistakesCount = totalAttempted - totalCorrect;

			const subjectSessions = sessionsBySubject.get(subjId) || [];
			const subjectMinutes = subjectSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

			return {
				name: subjects.find((s) => s.id === subjId)?.name || 'Unknown',
				overallScore: score,
				recentScore: null,
				questionsAttempted: totalAttempted,
				confidenceScore: Math.min(avgConfidence, 1),
				mistakesCount,
				timeMinutes: subjectMinutes,
				needsAttention: score < 60,
			};
		});

		const exams = calendarData.map((event: (typeof calendarData)[number]) => {
			const daysLeft = Math.ceil(
				(new Date(event.startTime).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
			);
			const subjectName = event.title || 'Exam';
			const readiness =
				subjectPerformance.find((s: (typeof subjectPerformance)[number]) =>
					subjectName.toLowerCase().includes(s.name.toLowerCase())
				)?.overallScore ?? 50;

			return {
				subject: subjectName,
				date: new Date(event.startTime).toISOString(),
				daysLeft: Math.max(daysLeft, 0),
				readiness,
				priority: daysLeft <= 7 ? 'high' : daysLeft <= 14 ? 'medium' : 'low',
			};
		});

		const alerts = generateAlerts({
			totalHoursThisWeek,
			lastStudyDate: recentSessionsData[0]?.startedAt,
			recentQuizScores: quizScores,
			exams,
			studentName: 'Your child',
		});

		return NextResponse.json({
			overview: {
				streakDays: progress?.streakDays || 0,
				totalHoursThisWeek: Math.round(totalHoursThisWeek * 10) / 10,
				averageQuizScore: avgQuizScore,
				tasksCompleted: recentSessionsData.filter(
					(s: (typeof recentSessionsData)[number]) => s.completedAt
				).length,
				totalTasks: Math.max(recentSessionsData.length, 1),
			},
			weeklyProgress: {
				dailyMinutes,
				tasksCompleted: recentSessionsData.filter(
					(s: (typeof recentSessionsData)[number]) => s.completedAt
				).length,
				tasksPlanned: Math.max(recentSessionsData.length, 7),
				quizTrend: quizScores.slice(0, 7),
				flashcardStreak,
			},
			subjectPerformance: {
				subjects: subjectPerformance,
			},
			upcomingExams: {
				exams,
			},
			alerts: {
				alerts,
			},
		});
	} catch (error) {
		console.error('Error fetching parent dashboard data:', error);
		return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await getAuth();
		const headersList = request.headers;
		const session = await auth.api.getSession({ headers: headersList as never });

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { alertId, action, settings } = body;

		if (action === 'dismiss' && alertId) {
			return NextResponse.json({ success: true, dismissed: alertId });
		}

		if (settings) {
			return NextResponse.json({ success: true, settings });
		}

		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	} catch (error) {
		console.error('Error updating parent dashboard:', error);
		return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
	}
}

function generateAlerts(data: {
	totalHoursThisWeek: number;
	lastStudyDate: Date | null | undefined;
	recentQuizScores: number[];
	exams: { subject: string; daysLeft: number }[];
	studentName: string;
}) {
	const alerts: {
		id: string;
		type: 'warning' | 'info' | 'success';
		title: string;
		message: string;
		createdAt: string;
		dismissed: boolean;
	}[] = [];

	if (data.lastStudyDate) {
		const daysSinceStudy = Math.floor(
			(Date.now() - new Date(data.lastStudyDate).getTime()) / (24 * 60 * 60 * 1000)
		);
		if (daysSinceStudy >= 3) {
			alerts.push({
				id: 'no-study',
				type: 'warning',
				title: 'No study activity',
				message: `${data.studentName} hasn't studied in ${daysSinceStudy} days. Consider checking in with them.`,
				createdAt: new Date().toISOString(),
				dismissed: false,
			});
		}
	}

	const lowScores = data.recentQuizScores.filter((s) => s < 60);
	if (lowScores.length >= 2) {
		alerts.push({
			id: 'low-scores',
			type: 'warning',
			title: 'Quiz scores dropping',
			message: `${lowScores.length} recent quizzes scored below 60%. Extra practice may help.`,
			createdAt: new Date().toISOString(),
			dismissed: false,
		});
	}

	for (const exam of data.exams) {
		if (exam.daysLeft <= 14 && exam.daysLeft > 0) {
			alerts.push({
				id: `exam-${exam.subject}`,
				type: exam.daysLeft <= 7 ? 'warning' : 'info',
				title: `${exam.subject} exam in ${exam.daysLeft} days`,
				message: `Consider encouraging more practice for ${exam.subject}.`,
				createdAt: new Date().toISOString(),
				dismissed: false,
			});
		}
	}

	if (data.totalHoursThisWeek >= 5) {
		alerts.push({
			id: 'good-week',
			type: 'success',
			title: 'Great study week!',
			message: `${data.totalHoursThisWeek.toFixed(1)} hours of study this week. Keep it up!`,
			createdAt: new Date().toISOString(),
			dismissed: false,
		});
	}

	return alerts;
}
