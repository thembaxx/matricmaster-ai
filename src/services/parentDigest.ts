'use server';

import { and, desc, eq, gte } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import { quizResults, studySessions, subjects, userProgress } from '@/lib/db/schema';

export interface ParentDigest {
	weekStart: Date;
	weekEnd: Date;
	studyHours: number;
	tasksCompleted: number;
	quizzesTaken: number;
	averageScore: number;
	strongestSubject: string;
	weakestSubject: string;
	upcomingExams: { subject: string; daysLeft: number }[];
	suggestions: string[];
}

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb();
}

export async function generateWeeklyDigest(userId: string): Promise<ParentDigest> {
	const db = await getDb();

	const weekEnd = new Date();
	const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

	const sessions = await db
		.select()
		.from(studySessions)
		.where(
			and(
				eq(studySessions.userId, userId),
				gte(studySessions.startedAt, weekStart),
				studySessions.completedAt
			)
		)
		.orderBy(desc(studySessions.startedAt));

	const quizzes = await db
		.select()
		.from(quizResults)
		.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, weekStart)))
		.orderBy(desc(quizResults.completedAt));

	const progressData = await db
		.select()
		.from(userProgress)
		.innerJoin(subjects, eq(userProgress.subjectId, subjects.id))
		.where(eq(userProgress.userId, userId));

	const studyHours = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;
	const tasksCompleted = sessions.filter((s) => s.completedAt).length;
	const quizzesTaken = quizzes.length;
	const averageScore =
		quizzes.length > 0
			? Math.round(quizzes.reduce((sum, q) => sum + Number(q.percentage || 0), 0) / quizzes.length)
			: 0;

	let strongestSubject = 'N/A';
	let weakestSubject = 'N/A';
	let highestScore = 0;
	let lowestScore = 100;

	for (const p of progressData) {
		const prog = p.user_progress;
		const subject = p.subjects;
		const total = prog.totalQuestionsAttempted || 0;
		const correct = prog.totalCorrect || 0;
		const score = total > 0 ? Math.round((correct / total) * 100) : 0;

		if (score > highestScore) {
			highestScore = score;
			strongestSubject = subject.name;
		}
		if (score < lowestScore && total > 0) {
			lowestScore = score;
			weakestSubject = subject.name;
		}
	}

	const suggestions: string[] = [];

	if (studyHours < 5) {
		suggestions.push('Try to increase study time to at least 1 hour per day.');
	}
	if (averageScore < 60) {
		suggestions.push(
			`Quiz scores are below 60%. Consider focusing on ${weakestSubject} with the AI Tutor.`
		);
	}
	if (quizzesTaken < 3) {
		suggestions.push('Encourage more quiz practice - aim for at least 1 quiz per day.');
	}
	if (studyHours >= 10) {
		suggestions.push('Excellent study commitment this week! Keep up the great work.');
	}
	if (averageScore >= 80) {
		suggestions.push('Outstanding quiz performance! Consider tackling harder topics.');
	}

	return {
		weekStart,
		weekEnd,
		studyHours: Math.round(studyHours * 10) / 10,
		tasksCompleted,
		quizzesTaken,
		averageScore,
		strongestSubject,
		weakestSubject,
		upcomingExams: [],
		suggestions,
	};
}

export async function sendParentDigest(digest: ParentDigest, parentEmail: string): Promise<void> {
	const weekStartStr = digest.weekStart.toLocaleDateString('en-ZA', {
		month: 'short',
		day: 'numeric',
	});
	const weekEndStr = digest.weekEnd.toLocaleDateString('en-ZA', {
		month: 'short',
		day: 'numeric',
	});

	const html = `
		<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
			<h1 style="color: #1a1a1a; font-size: 24px;">Weekly Study Digest</h1>
			<p style="color: #666; font-size: 14px;">${weekStartStr} - ${weekEndStr}</p>

			<div style="background: #f5f5f5; border-radius: 16px; padding: 24px; margin: 20px 0;">
				<h2 style="font-size: 18px; margin: 0 0 16px;">This Week's Summary</h2>
				<table style="width: 100%; font-size: 14px;">
					<tr>
						<td style="padding: 8px 0; color: #666;">Study Hours</td>
						<td style="padding: 8px 0; font-weight: bold; text-align: right;">${digest.studyHours}h</td>
					</tr>
					<tr>
						<td style="padding: 8px 0; color: #666;">Tasks Completed</td>
						<td style="padding: 8px 0; font-weight: bold; text-align: right;">${digest.tasksCompleted}</td>
					</tr>
					<tr>
						<td style="padding: 8px 0; color: #666;">Quizzes Taken</td>
						<td style="padding: 8px 0; font-weight: bold; text-align: right;">${digest.quizzesTaken}</td>
					</tr>
					<tr>
						<td style="padding: 8px 0; color: #666;">Average Score</td>
						<td style="padding: 8px 0; font-weight: bold; text-align: right;">${digest.averageScore}%</td>
					</tr>
					<tr>
						<td style="padding: 8px 0; color: #666;">Strongest Subject</td>
						<td style="padding: 8px 0; font-weight: bold; text-align: right;">${digest.strongestSubject}</td>
					</tr>
					<tr>
						<td style="padding: 8px 0; color: #666;">Needs Improvement</td>
						<td style="padding: 8px 0; font-weight: bold; text-align: right;">${digest.weakestSubject}</td>
					</tr>
				</table>
			</div>

			${
				digest.suggestions.length > 0
					? `
			<div style="margin: 20px 0;">
				<h2 style="font-size: 18px; margin: 0 0 12px;">Suggestions</h2>
				<ul style="padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
					${digest.suggestions.map((s) => `<li>${s}</li>`).join('')}
				</ul>
			</div>
			`
					: ''
			}

			<div style="text-align: center; margin: 30px 0;">
				<a href="https://lumi.ai/parent-dashboard" style="background: #000; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 14px;">
					View Full Dashboard
				</a>
			</div>

			<p style="color: #999; font-size: 12px; text-align: center;">
				MatricMaster AI - Your child's success is our mission
			</p>
		</div>
	`;

	console.log(`[ParentDigest] Email digest prepared for ${parentEmail}`);
	console.log(
		`[ParentDigest] Study hours: ${digest.studyHours}, Average score: ${digest.averageScore}%`
	);
	console.log(`[ParentDigest] HTML length: ${html.length} chars`);

	return Promise.resolve();
}
