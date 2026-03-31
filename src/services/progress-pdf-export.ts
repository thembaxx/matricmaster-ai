'use server';

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import jsPDF from 'jspdf';
import { type DbType, dbManager } from '@/lib/db';
import { ensureAuthenticated } from '@/lib/db/auth-utils';
import {
	flashcardReviews,
	leaderboardEntries,
	quizResults,
	studySessions,
	subjects,
	topicMastery,
	userProgress,
	users,
} from '@/lib/db/schema';
import { getXPLevel, type LevelInfo } from '@/services/xpSystem';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

function getWeekBounds(date: Date): { start: Date; end: Date } {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	d.setHours(0, 0, 0, 0);
	const start = new Date(d);
	const end = new Date(d);
	end.setDate(end.getDate() + 6);
	end.setHours(23, 59, 59, 999);
	return { start, end };
}

export interface WeeklyReportData {
	generatedAt: Date;
	dateRange: { start: Date; end: Date };
	userName: string;
	weeklyStats: {
		totalStudyMinutes: number;
		quizzesTaken: number;
		questionsAnswered: number;
		correctAnswers: number;
		accuracy: number;
		xpEarned: number;
		flashcardsReviewed: number;
	};
	subjectProgress: {
		subjectId: number;
		subjectName: string;
		questionsAttempted: number;
		questionsCorrect: number;
		accuracy: number;
		masteryLevel: number;
	}[];
	quizPerformance: {
		quizId: string;
		topic: string;
		score: number;
		totalQuestions: number;
		percentage: number;
		date: Date;
	}[];
	streakInfo: {
		currentStreak: number;
		bestStreak: number;
		studyDaysThisWeek: number;
	};
	achievements: {
		id: string;
		name: string;
		icon: string;
		points: number;
		unlockedAt: Date;
	}[];
	levelInfo: LevelInfo;
}

function createAsciiBarChart(
	data: { label: string; value: number; maxValue: number }[],
	width = 30
): string {
	if (data.length === 0) return 'No data available';
	const maxVal = Math.max(...data.map((d) => d.maxValue || d.value), 1);
	const lines: string[] = [];
	for (const item of data) {
		const barLength = Math.round((item.value / maxVal) * width);
		const bar = '█'.repeat(barLength);
		const label = item.label.substring(0, 12).padEnd(12);
		lines.push(`${label} |${bar} ${item.value}`);
	}
	return lines.join('\n');
}

function formatStudyTime(minutes: number): string {
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export async function generateWeeklyReport(
	startDate?: Date,
	endDate?: Date
): Promise<{ success: boolean; data?: WeeklyReportData; error?: string }> {
	try {
		const user = await ensureAuthenticated();
		const userId = user.id;
		const db = await getDb();

		const now = startDate ? new Date(startDate) : new Date();
		const { start, end } = getWeekBounds(endDate || now);

		await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		const weeklySessions = await db.query.studySessions.findMany({
			where: and(
				eq(studySessions.userId, userId),
				gte(studySessions.startedAt, start),
				sql`${studySessions.startedAt} <= ${end}`
			),
			orderBy: [desc(studySessions.completedAt)],
		});

		const totalStudyMinutes = weeklySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
		const quizzesTaken = weeklySessions.filter((s) => s.sessionType === 'quiz').length;
		const questionsAnswered = weeklySessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
		const correctAnswers = weeklySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
		const accuracy =
			questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

		const weeklyXp = await db
			.select({ total: sql<number>`COALESCE(SUM(${leaderboardEntries.totalPoints}), 0)` })
			.from(leaderboardEntries)
			.where(
				and(
					eq(leaderboardEntries.userId, userId),
					eq(leaderboardEntries.periodType, 'monthly'),
					gte(leaderboardEntries.periodStart, start)
				)
			);

		const flashcardReviewData = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(flashcardReviews)
			.where(
				and(
					eq(flashcardReviews.userId, userId),
					gte(flashcardReviews.reviewedAt, start),
					sql`${flashcardReviews.reviewedAt} <= ${end}`
				)
			);

		const quizResultsData = await db.query.quizResults.findMany({
			where: and(
				eq(quizResults.userId, userId),
				gte(quizResults.completedAt, start),
				sql`${quizResults.completedAt} <= ${end}`
			),
			orderBy: [desc(quizResults.completedAt)],
		});

		const subjectProgressData: WeeklyReportData['subjectProgress'] = [];
		const subjectMap = new Map<number, { name: string; attempted: number; correct: number }>();

		for (const session of weeklySessions) {
			if (!session.subjectId) continue;
			const subjectId = Number(session.subjectId);
			const existing = subjectMap.get(subjectId) || {
				name: '',
				attempted: 0,
				correct: 0,
			};
			existing.attempted += session.questionsAttempted;
			existing.correct += session.correctAnswers;
			subjectMap.set(subjectId, existing);
		}

		if (subjectMap.size > 0) {
			const subjectIds = Array.from(subjectMap.keys());
			const subjectsData = await db.query.subjects.findMany({
				where: sql`${subjects.id} = ANY(${subjectIds})`,
			});
			for (const s of subjectsData) {
				const data = subjectMap.get(Number(s.id));
				if (data) {
					data.name = s.name;
				}
			}
		}

		for (const [subjectId, data] of subjectMap) {
			const mastery = await db.query.topicMastery.findMany({
				where: and(eq(topicMastery.userId, userId), eq(topicMastery.subjectId, subjectId)),
			});
			const avgMastery =
				mastery.length > 0
					? Math.round(mastery.reduce((sum, t) => sum + Number(t.masteryLevel), 0) / mastery.length)
					: 0;
			subjectProgressData.push({
				subjectId,
				subjectName: data.name || `Subject ${subjectId}`,
				questionsAttempted: data.attempted,
				questionsCorrect: data.correct,
				accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
				masteryLevel: avgMastery,
			});
		}
		subjectProgressData.sort((a, b) => b.questionsAttempted - a.questionsAttempted);

		const quizPerformance: WeeklyReportData['quizPerformance'] = quizResultsData.map((q) => ({
			quizId: q.quizId || '',
			topic: q.quizId || 'Quiz',
			score: q.score,
			totalQuestions: q.totalQuestions,
			percentage: Number(q.percentage),
			date: q.completedAt,
		}));

		const progress = await db.query.userProgress.findFirst({
			where: eq(userProgress.userId, userId),
		});

		const studyDaysSet = new Set<string>();
		for (const s of weeklySessions) {
			if (s.startedAt) {
				studyDaysSet.add(new Date(s.startedAt).toDateString());
			}
		}

		const totalXp = progress?.totalMarksEarned || 0;
		const levelInfo = await getXPLevel(totalXp);

		const reportData: WeeklyReportData = {
			generatedAt: new Date(),
			dateRange: { start, end },
			userName: user?.name || 'Student',
			weeklyStats: {
				totalStudyMinutes,
				quizzesTaken,
				questionsAnswered,
				correctAnswers,
				accuracy,
				xpEarned: weeklyXp[0]?.total || 0,
				flashcardsReviewed: flashcardReviewData[0]?.count || 0,
			},
			subjectProgress: subjectProgressData,
			quizPerformance,
			streakInfo: {
				currentStreak: progress?.streakDays || 0,
				bestStreak: progress?.bestStreak || 0,
				studyDaysThisWeek: studyDaysSet.size,
			},
			achievements: [],
			levelInfo,
		};

		return { success: true, data: reportData };
	} catch (error) {
		console.error('Error generating weekly report:', error);
		return { success: false, error: 'Failed to generate report data' };
	}
}

export async function exportWeeklyReportPDF(startDate?: Date): Promise<Buffer | null> {
	const result = await generateWeeklyReport(startDate);
	if (!result.success || !result.data) {
		return null;
	}

	const doc = new jsPDF();
	const data = result.data;
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 15;
	let y = 20;

	doc.setFillColor(30, 64, 175);
	doc.rect(0, 0, pageWidth, 35, 'F');
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(22);
	doc.setFont('helvetica', 'bold');
	doc.text('MatricMaster AI', margin, 18);
	doc.setFontSize(14);
	doc.setFont('helvetica', 'normal');
	doc.text('Weekly Progress Report', margin, 26);
	doc.setFontSize(10);
	const dateRangeText = `Week of ${data.dateRange.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - ${data.dateRange.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
	doc.text(dateRangeText, margin, 32);
	y = 45;

	doc.setTextColor(30, 30, 30);
	doc.setFontSize(16);
	doc.setFont('helvetica', 'bold');
	doc.text(`Hello, ${data.userName}!`, margin, y);
	y += 12;

	doc.setFontSize(10);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(80, 80, 80);
	doc.text(
		`Generated on ${data.generatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
		margin,
		y
	);
	y += 15;

	doc.setFillColor(245, 247, 250);
	doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 3, 3, 'F');
	doc.setTextColor(30, 30, 30);
	doc.setFontSize(14);
	doc.setFont('helvetica', 'bold');
	doc.text('Weekly Summary', margin + 5, y + 10);
	y += 18;

	doc.setFontSize(10);
	doc.setFont('helvetica', 'normal');
	const stats = data.weeklyStats;
	const statsLines = [
		`Study Time: ${formatStudyTime(stats.totalStudyMinutes)}  |  Quizzes: ${stats.quizzesTaken}  |  Questions: ${stats.questionsAnswered}`,
		`Correct: ${stats.correctAnswers} (${stats.accuracy}%)  |  XP Earned: ${stats.xpEarned}  |  Flashcards Reviewed: ${stats.flashcardsReviewed}`,
	];
	doc.text(statsLines[0], margin + 5, y);
	y += 6;
	doc.text(statsLines[1], margin + 5, y);
	y += 15;

	doc.setFillColor(30, 64, 175);
	doc.roundedRect(margin, y, 85, 30, 2, 2, 'F');
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(12);
	doc.setFont('helvetica', 'bold');
	doc.text('Streak', margin + 5, y + 8);
	doc.setFontSize(20);
	doc.text(`${data.streakInfo.currentStreak} days`, margin + 5, y + 20);
	doc.setFontSize(10);
	doc.setFont('helvetica', 'normal');
	doc.text(`Best: ${data.streakInfo.bestStreak} days`, margin + 5, y + 27);

	doc.setFillColor(34, 197, 94);
	doc.roundedRect(margin + 90, y, 85, 30, 2, 2, 'F');
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(12);
	doc.setFont('helvetica', 'bold');
	doc.text('Level Progress', margin + 95, y + 8);
	doc.setFontSize(20);
	doc.text(`Level ${data.levelInfo.level}`, margin + 95, y + 20);
	doc.setFontSize(10);
	doc.text(
		`${data.levelInfo.title} (${data.levelInfo.progressPercent}% to next)`,
		margin + 95,
		y + 27
	);
	y += 40;

	if (data.subjectProgress.length > 0) {
		doc.setTextColor(30, 30, 30);
		doc.setFontSize(14);
		doc.setFont('helvetica', 'bold');
		doc.text('Subject Progress', margin, y);
		y += 8;

		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(80, 80, 80);
		const chartData = data.subjectProgress.slice(0, 6).map((s) => ({
			label: s.subjectName.length > 15 ? `${s.subjectName.substring(0, 15)}.` : s.subjectName,
			value: s.masteryLevel,
			maxValue: 100,
		}));
		doc.text(createAsciiBarChart(chartData, 25), margin, y);
		y += chartData.length * 5 + 5;

		doc.setTextColor(30, 30, 30);
		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.text('Subject', margin, y);
		doc.text('Questions', margin + 60, y);
		doc.text('Accuracy', margin + 90, y);
		doc.text('Mastery', margin + 120, y);
		y += 6;

		doc.setFont('helvetica', 'normal');
		doc.setFontSize(9);
		for (const subject of data.subjectProgress.slice(0, 6)) {
			doc.text(subject.subjectName.substring(0, 25), margin, y);
			doc.text(`${subject.questionsAttempted}`, margin + 60, y);
			doc.text(`${subject.accuracy}%`, margin + 90, y);
			doc.text(`${subject.masteryLevel}%`, margin + 120, y);
			y += 5;
		}
		y += 5;
	}

	if (data.quizPerformance.length > 0) {
		if (y > 230) {
			doc.addPage();
			y = 20;
		}

		doc.setTextColor(30, 30, 30);
		doc.setFontSize(14);
		doc.setFont('helvetica', 'bold');
		doc.text('Quiz Performance', margin, y);
		y += 8;

		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(80, 80, 80);
		doc.text('Quiz', margin, y);
		doc.text('Score', margin + 70, y);
		doc.text('Date', margin + 110, y);
		y += 6;

		doc.setFont('helvetica', 'normal');
		for (const quiz of data.quizPerformance.slice(0, 8)) {
			doc.text(quiz.topic.substring(0, 30), margin, y);
			doc.text(
				`${quiz.score}/${quiz.totalQuestions} (${Math.round(quiz.percentage)}%)`,
				margin + 70,
				y
			);
			doc.text(
				new Date(quiz.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
				margin + 110,
				y
			);
			y += 5;
		}
	}

	if (data.achievements.length > 0) {
		if (y > 230) {
			doc.addPage();
			y = 20;
		}

		y += 5;
		doc.setTextColor(30, 30, 30);
		doc.setFontSize(14);
		doc.setFont('helvetica', 'bold');
		doc.text('Achievements This Week', margin, y);
		y += 8;

		doc.setFontSize(10);
		for (const achievement of data.achievements.slice(0, 5)) {
			doc.text(`${achievement.icon} ${achievement.name} (+${achievement.points} XP)`, margin, y);
			y += 5;
		}
	}

	y += 10;
	if (y > 270) {
		doc.addPage();
		y = 20;
	}

	doc.setFontSize(8);
	doc.setTextColor(150, 150, 150);
	doc.text('Generated by MatricMaster AI - Your NSC Exam Companion', margin, y);
	doc.text('South African National Senior Certificate (NSC) Curriculum', margin, y + 4);

	return Buffer.from(doc.output('arraybuffer'));
}

export async function generateCustomDateRangeReport(
	start: Date,
	end: Date
): Promise<Buffer | null> {
	const result = await generateWeeklyReport(start, end);
	if (!result.success || !result.data) {
		return null;
	}

	const doc = new jsPDF();
	const data = result.data;
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 15;
	let y = 20;

	doc.setFillColor(30, 64, 175);
	doc.rect(0, 0, pageWidth, 35, 'F');
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(22);
	doc.setFont('helvetica', 'bold');
	doc.text('MatricMaster AI', margin, 18);
	doc.setFontSize(14);
	doc.setFont('helvetica', 'normal');
	doc.text('Progress Report', margin, 26);
	doc.setFontSize(10);
	const dateRangeText = `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
	doc.text(dateRangeText, margin, 32);
	y = 45;

	doc.setTextColor(30, 30, 30);
	doc.setFontSize(16);
	doc.setFont('helvetica', 'bold');
	doc.text(`Report for ${data.userName}`, margin, y);
	y += 15;

	doc.setFontSize(11);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(80, 80, 80);
	const stats = data.weeklyStats;
	doc.text(`Total Study Time: ${formatStudyTime(stats.totalStudyMinutes)}`, margin, y);
	y += 6;
	doc.text(`Quizzes Completed: ${stats.quizzesTaken}`, margin, y);
	y += 6;
	doc.text(
		`Questions Answered: ${stats.questionsAnswered} (${stats.correctAnswers} correct, ${stats.accuracy}% accuracy)`,
		margin,
		y
	);
	y += 6;
	doc.text(`XP Earned: ${stats.xpEarned}`, margin, y);
	y += 6;
	doc.text(`Flashcards Reviewed: ${stats.flashcardsReviewed}`, margin, y);
	y += 10;

	doc.setTextColor(30, 30, 30);
	doc.setFontSize(12);
	doc.setFont('helvetica', 'bold');
	doc.text('Streak Information', margin, y);
	y += 8;
	doc.setFontSize(10);
	doc.setFont('helvetica', 'normal');
	doc.text(`Current Streak: ${data.streakInfo.currentStreak} days`, margin, y);
	y += 5;
	doc.text(`Best Streak: ${data.streakInfo.bestStreak} days`, margin, y);
	y += 5;
	doc.text(`Study Days This Period: ${data.streakInfo.studyDaysThisWeek}`, margin, y);
	y += 10;

	if (data.subjectProgress.length > 0) {
		doc.setFontSize(12);
		doc.setFont('helvetica', 'bold');
		doc.text('Subject Breakdown', margin, y);
		y += 8;

		doc.setFontSize(9);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(80, 80, 80);
		doc.text('Subject', margin, y);
		doc.text('Questions', margin + 50, y);
		doc.text('Accuracy', margin + 80, y);
		doc.text('Mastery', margin + 105, y);
		y += 5;

		doc.setFont('helvetica', 'normal');
		for (const subject of data.subjectProgress) {
			doc.text(subject.subjectName.substring(0, 25), margin, y);
			doc.text(`${subject.questionsAttempted}`, margin + 50, y);
			doc.text(`${subject.accuracy}%`, margin + 80, y);
			doc.text(`${subject.masteryLevel}%`, margin + 105, y);
			y += 5;
		}
	}

	return Buffer.from(doc.output('arraybuffer'));
}
