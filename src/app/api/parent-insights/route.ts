import { and, desc, eq, gte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { quizResults, studySessions, subjects, userProgress } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const headersList = await request.headers;
		const session = await auth.api.getSession({ headers: headersList as never });

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { studentName = 'Your child' } = body;

		const userId = session.user.id;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
		}

		const db = dbManager.getDb();

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
				.filter((s) => new Date(s.startedAt || 0) >= sevenDaysAgo)
				.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;

		const totalHoursLastWeek =
			recentSessionsData
				.filter(
					(s) =>
						new Date(s.startedAt || 0) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
						new Date(s.startedAt || 0) < sevenDaysAgo
				)
				.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;

		const weeklyChange = totalHoursThisWeek - totalHoursLastWeek;

		const subjectScores = progressData.map((p) => {
			const progress = p.user_progress;
			const subject = p.subjects;
			const totalAttempted = progress.totalQuestionsAttempted || 0;
			const totalCorrect = progress.totalCorrect || 0;
			const score = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

			const recentSubjectQuizzes = recentQuizzes;
			const avgRecentScore =
				recentSubjectQuizzes.length > 0
					? Math.round(
							recentSubjectQuizzes.reduce((sum, q) => sum + Number(q.score || 0), 0) /
								recentSubjectQuizzes.length
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
						subjectScores.reduce((sum, s) => sum + (s.overallScore || 0), 0) / subjectScores.length
					)
				: 0;

		const weakSubjects = subjectScores
			.filter((s) => s.recentScore !== null && s.recentScore < 60)
			.sort((a, b) => (a.recentScore || 0) - (b.recentScore || 0));

		const strongSubjects = subjectScores
			.filter((s) => s.recentScore !== null && s.recentScore >= 80)
			.sort((a, b) => (b.recentScore || 0) - (a.recentScore || 0));

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
