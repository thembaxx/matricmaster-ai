import { addDays, differenceInDays, format, startOfWeek } from 'date-fns';
import { asc, desc, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { studyPlans, topicConfidence } from '@/lib/db/schema';
import type { AISuggestion, ExamCountdown, StudyBlock } from '@/types/smart-scheduler';

export async function getWeakAreas(): Promise<{ topic: string; score: number }[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	try {
		await dbManager.initialize();
		const db = dbManager.getDb();
		const confidence = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, session.user.id),
			orderBy: [asc(topicConfidence.confidenceScore)],
			limit: 10,
		});

		return confidence.map((c) => ({
			topic: c.topic,
			score: Number.parseFloat(String(c.confidenceScore)),
		}));
	} catch (error) {
		console.error('Error fetching weak areas:', error);
		return [];
	}
}

export async function getExamCountdowns(): Promise<ExamCountdown[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	try {
		await dbManager.initialize();
		const db = dbManager.getDb();

		const plans = await db.query.studyPlans.findMany({
			where: eq(studyPlans.userId, session.user.id),
			orderBy: [desc(studyPlans.targetExamDate)],
		});

		const now = new Date();
		const exams: ExamCountdown[] = [];

		for (const plan of plans) {
			if (plan.targetExamDate) {
				const examDate = new Date(plan.targetExamDate);
				const daysRemaining = differenceInDays(examDate, now);

				if (daysRemaining > 0 && daysRemaining <= 180) {
					exams.push({
						id: plan.id,
						subject: plan.title || 'General',
						date: examDate,
						daysRemaining,
						priority: daysRemaining <= 14 ? 'high' : daysRemaining <= 60 ? 'medium' : 'low',
					});
				}
			}
		}

		return exams.sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 5);
	} catch (error) {
		console.error('Error fetching exam countdowns:', error);
		return [];
	}
}

export function generateStudyBlocks(
	weakAreas: { topic: string; score: number }[],
	_examCountdowns: ExamCountdown[],
	weeklyHours = 20
): StudyBlock[] {
	const blocks: StudyBlock[] = [];
	const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

	if (weakAreas.length === 0) {
		return [];
	}

	const totalScore = weakAreas.reduce((sum, w) => sum + (1 - w.score), 0);

	for (let day = 0; day < 5; day++) {
		const date = addDays(weekStart, day);
		let dayMinutes = (weeklyHours * 60) / 5;

		const dayBlocks: StudyBlock[] = [];

		for (const weakArea of weakAreas.slice(0, 3)) {
			if (dayMinutes <= 0) break;

			const sessionDuration = Math.min(
				90,
				Math.max(25, Math.round((dayMinutes * (1 - weakArea.score)) / totalScore))
			);
			const startHour = 9 + dayBlocks.length * 2;

			if (startHour >= 21) continue;

			const endHour = startHour + Math.floor(sessionDuration / 60);
			const endMin = sessionDuration % 60;

			dayBlocks.push({
				id: crypto.randomUUID(),
				subject: weakArea.topic.split(' ')[0] || 'General',
				topic: weakArea.topic,
				date,
				startTime: `${startHour.toString().padStart(2, '0')}:00`,
				endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
				duration: sessionDuration,
				type: weakArea.score < 0.5 ? 'study' : 'practice',
				isCompleted: false,
				isAISuggested: true,
			});

			dayMinutes -= sessionDuration;
		}

		blocks.push(...dayBlocks);
	}

	return blocks;
}

export function detectConflicts(blocks: StudyBlock[]): AISuggestion[] {
	const suggestions: AISuggestion[] = [];
	const sorted = [...blocks].sort((a, b) => {
		const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
		if (dateCompare !== 0) return dateCompare;
		return a.startTime.localeCompare(b.startTime);
	});

	for (let i = 0; i < sorted.length - 1; i++) {
		const current = sorted[i];
		const next = sorted[i + 1];

		if (
			format(new Date(current.date), 'yyyy-MM-dd') === format(new Date(next.date), 'yyyy-MM-dd') &&
			current.startTime < next.endTime &&
			current.endTime > next.startTime
		) {
			suggestions.push({
				id: crypto.randomUUID(),
				type: 'reschedule',
				block: { id: next.id },
				reason: `Overlaps with ${current.subject} session`,
				confidence: 0.9,
			});
		}
	}

	return suggestions;
}
