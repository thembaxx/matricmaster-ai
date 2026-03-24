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

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const headersList = request.headers;
		const session = await auth.api.getSession({ headers: headersList as never });

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { studentName = 'Your child' } = body;

		const userId = session.user.id;

		const db = await getDb();

		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		const recentQuizzes = await db
			.select()
			.from(quizResults)
			.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, thirtyDaysAgo)))
			.orderBy(desc(quizResults.completedAt))
			.limit(20);

		const recentSessionsData = await db
			.select()
			.from(studySessions)
			.where(
				and(
					eq(studySessions.userId, userId),
					gte(studySessions.startedAt, thirtyDaysAgo),
					studySessions.completedAt
				)
			)
			.orderBy(desc(studySessions.startedAt))
			.limit(30);

		const progressData = await db
			.select()
			.from(userProgress)
			.innerJoin(subjects, eq(userProgress.subjectId, subjects.id))
			.where(eq(userProgress.userId, userId));

		const totalHoursThisWeek =
			recentSessionsData
				.filter(
					(s: (typeof recentSessionsData)[number]) => new Date(s.startedAt || 0) >= sevenDaysAgo
				)
				.reduce(
					(sum: number, s: (typeof recentSessionsData)[number]) => sum + (s.durationMinutes || 0),
					0
				) / 60;

		const totalHoursLastWeek =
			recentSessionsData
				.filter(
					(s: (typeof recentSessionsData)[number]) =>
						new Date(s.startedAt || 0) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
						new Date(s.startedAt || 0) < sevenDaysAgo
				)
				.reduce(
					(sum: number, s: (typeof recentSessionsData)[number]) => sum + (s.durationMinutes || 0),
					0
				) / 60;

		const weeklyChange = totalHoursThisWeek - totalHoursLastWeek;

		const subjectScores = progressData.map((p: (typeof progressData)[number]) => {
			const progress = p.user_progress;
			const subject = p.subjects;
			const totalAttempted = progress.totalQuestionsAttempted || 0;
			const totalCorrect = progress.totalCorrect || 0;
			const score = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

			const recentSubjectQuizzes = recentQuizzes;
			const avgRecentScore =
				recentSubjectQuizzes.length > 0
					? Math.round(
							recentSubjectQuizzes.reduce(
								(sum: number, q: (typeof recentSubjectQuizzes)[number]) =>
									sum + Number(q.score || 0),
								0
							) / recentSubjectQuizzes.length
						)
					: null;

			return {
				name: subject.name,
				overallScore: score,
				recentScore: avgRecentScore,
				questionsAttempted: totalAttempted,
			};
		});

		const overallAvg =
			subjectScores.length > 0
				? Math.round(
						subjectScores.reduce(
							(sum: number, s: (typeof subjectScores)[number]) => sum + (s.overallScore || 0),
							0
						) / subjectScores.length
					)
				: 0;

		const weakSubjects = subjectScores
			.filter((s: (typeof subjectScores)[number]) => s.recentScore !== null && s.recentScore < 60)
			.sort(
				(a: (typeof subjectScores)[number], b: (typeof subjectScores)[number]) =>
					(a.recentScore || 0) - (b.recentScore || 0)
			);

		const strongSubjects = subjectScores
			.filter((s: (typeof subjectScores)[number]) => s.recentScore !== null && s.recentScore >= 80)
			.sort(
				(a: (typeof subjectScores)[number], b: (typeof subjectScores)[number]) =>
					(b.recentScore || 0) - (a.recentScore || 0)
			);

		const insight = generateInsight(studentName, {
			totalHoursThisWeek,
			weeklyChange,
			overallAvg,
			weakSubjects,
			strongSubjects,
			recentQuizzesCount: recentQuizzes.length,
		});

		return NextResponse.json({
			stats: {
				totalHoursThisWeek: Math.round(totalHoursThisWeek * 10) / 10,
				weeklyChange: Math.round(weeklyChange * 10) / 10,
				overallAvg,
				subjects: subjectScores,
			},
			insight,
			weakSubjects,
			strongSubjects,
		});
	} catch (error) {
		console.error('Error generating parent insights:', error);
		return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
	}
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

		const recentSessionsData = await db
			.select()
			.from(studySessions)
			.where(
				and(
					eq(studySessions.userId, userId),
					gte(studySessions.startedAt, thirtyDaysAgo),
					studySessions.completedAt
				)
			)
			.orderBy(desc(studySessions.startedAt));

		const recentQuizzes = await db
			.select()
			.from(quizResults)
			.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, thirtyDaysAgo)))
			.orderBy(desc(quizResults.completedAt))
			.limit(20);

		const progressData = await db
			.select()
			.from(userProgress)
			.innerJoin(subjects, eq(userProgress.subjectId, subjects.id))
			.where(eq(userProgress.userId, userId));

		const masteryData = await db.select().from(topicMastery).where(eq(topicMastery.userId, userId));

		const flashcardReviewsData = await db
			.select()
			.from(flashcardReviews)
			.where(
				and(eq(flashcardReviews.userId, userId), gte(flashcardReviews.reviewedAt, thirtyDaysAgo))
			)
			.orderBy(desc(flashcardReviews.reviewedAt));

		const calendarData = await db
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
			.limit(5);

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

		const subjectPerformance = progressData.map((p: (typeof progressData)[number]) => {
			const progress = p.user_progress;
			const subject = p.subjects;
			const totalAttempted = progress.totalQuestionsAttempted || 0;
			const totalCorrect = progress.totalCorrect || 0;
			const score = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

			const subjectMastery = masteryData.filter(
				(m: (typeof masteryData)[number]) => Number(m.subjectId) === subject.id
			);
			const avgConfidence =
				subjectMastery.length > 0
					? subjectMastery.reduce(
							(sum: number, m: (typeof masteryData)[number]) => sum + Number(m.masteryLevel),
							0
						) /
						subjectMastery.length /
						100
					: 0;

			const mistakesCount = totalAttempted - totalCorrect;

			const subjectMinutes = recentSessionsData
				.filter((s: (typeof recentSessionsData)[number]) => s.subjectId === subject.id)
				.reduce(
					(sum: number, s: (typeof recentSessionsData)[number]) => sum + (s.durationMinutes || 0),
					0
				);

			return {
				name: subject.name,
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

function generateInsight(
	studentName: string,
	data: {
		totalHoursThisWeek: number;
		weeklyChange: number;
		overallAvg: number;
		weakSubjects: { name: string; recentScore: number | null }[];
		strongSubjects: { name: string; recentScore: number | null }[];
		recentQuizzesCount: number;
	}
): string {
	const {
		totalHoursThisWeek,
		weeklyChange,
		overallAvg,
		weakSubjects,
		strongSubjects,
		recentQuizzesCount,
	} = data;

	const studyTimeMsg =
		totalHoursThisWeek >= 5
			? `${studentName} is studying consistently with ${totalHoursThisWeek.toFixed(1)} hours this week.`
			: totalHoursThisWeek >= 2
				? `${studentName} has studied ${totalHoursThisWeek.toFixed(1)} hours this week. Try encouraging more study sessions.`
				: `${studentName} has only studied ${totalHoursThisWeek.toFixed(1)} hours this week. Motivation might be low.`;

	const changeMsg =
		weeklyChange > 0
			? ` That's ${weeklyChange.toFixed(1)} hours more than last week - great momentum!`
			: weeklyChange < 0
				? ` That's ${Math.abs(weeklyChange).toFixed(1)} hours less than last week.`
				: ' Study time is stable compared to last week.';

	let subjectMsg = '';
	if (weakSubjects.length > 0) {
		const weakest = weakSubjects[0];
		subjectMsg = ` ${weakest.name} needs attention - recent average is ${weakest.recentScore}%. Consider suggesting the Voice Breakdown feature.`;
	} else if (strongSubjects.length > 0) {
		const strongest = strongSubjects[0];
		subjectMsg = ` Excellent progress in ${strongest.name} (${strongest.recentScore}% average)!`;
	}

	const quizMsg =
		recentQuizzesCount >= 5
			? ` They've attempted ${recentQuizzesCount} quizzes this month - very active!`
			: recentQuizzesCount > 0
				? ` They've completed ${recentQuizzesCount} quizzes this month.`
				: ' No quiz activity this month - encourage some practice!';

	return `${studyTimeMsg}${changeMsg}${subjectMsg}${quizMsg} Overall mastery: ${overallAvg}%.`;
}
