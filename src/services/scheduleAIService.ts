import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { differenceInDays } from 'date-fns';
import { asc, eq } from 'drizzle-orm';
import { NSC_EXAM_DATES } from '@/data/exam-dates';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { topicConfidence } from '@/lib/db/schema';
import type { AISuggestion, ExamCountdown, StudyBlock } from '@/types/smart-scheduler';

function getGeminiModel() {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}
	const google = createGoogleGenerativeAI({ apiKey });
	return google('gemini-2.5-flash');
}

export async function getWeakAreas(): Promise<{ topic: string; subject: string; score: number }[]> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return [];

	try {
		await dbManager.initialize();
		const db = await dbManager.getDb();
		const confidence = await db.query.topicConfidence.findMany({
			where: eq(topicConfidence.userId, session.user.id),
			orderBy: [asc(topicConfidence.confidenceScore)],
			limit: 10,
		});

		return confidence.map((c: (typeof confidence)[number]) => ({
			topic: c.topic,
			subject: c.subject,
			score: Number.parseFloat(String(c.confidenceScore)),
		}));
	} catch (error) {
		console.error('Error fetching weak areas:', error);
		return [];
	}
}

export async function getExamCountdowns(): Promise<ExamCountdown[]> {
	try {
		const now = new Date();

		return NSC_EXAM_DATES.map((exam) => {
			const examDate = new Date(exam.date);
			const daysRemaining = differenceInDays(examDate, now);

			return {
				id: `${exam.subjectKey}-${exam.paper}`,
				subject: exam.subject,
				date: examDate,
				daysRemaining,
				priority:
					daysRemaining <= 14
						? ('high' as const)
						: daysRemaining <= 60
							? ('medium' as const)
							: ('low' as const),
			};
		})
			.filter((e) => e.daysRemaining > 0)
			.sort((a, b) => a.daysRemaining - b.daysRemaining);
	} catch (error) {
		console.error('Error computing exam countdowns:', error);
		return [];
	}
}

export async function generateSmartSchedule(
	weakAreas: { topic: string; subject: string; score: number }[],
	examCountdowns: ExamCountdown[]
): Promise<{ blocks: StudyBlock[]; suggestions: AISuggestion[] }> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		return { blocks: generateFallbackBlocks(weakAreas, examCountdowns), suggestions: [] };
	}

	try {
		const model = getGeminiModel();

		const weakTopicsStr = weakAreas
			.map((w) => `- ${w.subject}: ${w.topic} (confidence: ${Math.round(w.score * 100)}%)`)
			.join('\n');

		const examsStr = examCountdowns
			.filter((e) => e.daysRemaining > 0)
			.slice(0, 5)
			.map((e) => `- ${e.subject}: ${e.daysRemaining} days away (${e.priority} priority)`)
			.join('\n');

		const prompt = `You are a South African NSC Grade 12 study scheduler. Generate a weekly study schedule with 45-minute blocks.

Student's weak areas:
${weakTopicsStr || 'No weak areas detected yet.'}

Upcoming exams:
${examsStr || 'No upcoming exams found.'}

Rules:
- Each block is exactly 45 minutes
- Study hours: 7:00 to 20:00 (Mon-Fri), 8:00 to 14:00 (Sat)
- Prioritize weak topics and subjects with nearer exam dates
- Include 15-min break blocks every 2 sessions
- Mix study, review, and practice types
- Return ONLY valid JSON, no markdown

Output format:
{
  "blocks": [
    {
      "subject": "Mathematics",
      "topic": "Calculus",
      "dayOffset": 0,
      "startTime": "09:00",
      "endTime": "09:45",
      "type": "study"
    }
  ],
  "suggestions": [
    {
      "type": "add",
      "reason": "Suggestion reason",
      "subject": "Subject",
      "topic": "Topic",
      "confidence": 0.85
    }
  ]
}

Generate exactly 15-20 blocks for the week. dayOffset 0 = Monday.`;

		const { text } = await generateText({ model, prompt });

		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			return { blocks: generateFallbackBlocks(weakAreas, examCountdowns), suggestions: [] };
		}

		let parsed: { blocks?: Record<string, unknown>[]; suggestions?: Record<string, unknown>[] };
		try {
			parsed = JSON.parse(jsonMatch[0]);
		} catch (error) {
			console.warn('Failed to parse schedule AI response:', error);
			return { blocks: generateFallbackBlocks(weakAreas, examCountdowns), suggestions: [] };
		}
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

		const blocks: StudyBlock[] = ((parsed.blocks || []) as Record<string, unknown>[]).map((b) => {
			const date = new Date(weekStart);
			date.setDate(date.getDate() + ((b.dayOffset as number) || 0));
			const startStr = (b.startTime as string) || '09:00';
			const [sh, sm] = startStr.split(':').map(Number);
			const duration = 45;
			const endMin = sm + duration;
			const endH = sh + Math.floor(endMin / 60);
			const endM = endMin % 60;
			const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

			return {
				id: crypto.randomUUID(),
				subject: (b.subject as string) || 'General',
				topic: b.topic as string | undefined,
				date,
				startTime: startStr,
				endTime: endStr,
				duration,
				type: (b.type as 'study' | 'review' | 'practice' | 'break') || 'study',
				isCompleted: false,
				isAISuggested: true,
			};
		});

		const suggestions: AISuggestion[] = (
			(parsed.suggestions || []) as Record<string, unknown>[]
		).map((s) => ({
			id: crypto.randomUUID(),
			type: (s.type as 'add' | 'reschedule' | 'remove') || 'add',
			block: {
				subject: s.subject as string | undefined,
				topic: s.topic as string | undefined,
			},
			reason: (s.reason as string) || 'Recommended for you',
			confidence: (s.confidence as number) || 0.7,
		}));

		return { blocks, suggestions };
	} catch (error) {
		console.error('Gemini generation failed, using fallback:', error);
		return { blocks: generateFallbackBlocks(weakAreas, examCountdowns), suggestions: [] };
	}
}

function generateFallbackBlocks(
	weakAreas: { topic: string; subject: string; score: number }[],
	_examCountdowns: ExamCountdown[]
): StudyBlock[] {
	const blocks: StudyBlock[] = [];
	const weekStart = new Date();
	weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

	const subjects =
		weakAreas.length > 0
			? weakAreas
			: [{ topic: 'General revision', subject: 'Mathematics', score: 0.5 }];

	const timeSlots = ['08:00', '09:00', '10:00', '11:30', '13:30', '15:00'];

	for (let day = 0; day < 5; day++) {
		for (let i = 0; i < 2 && blocks.length < 15; i++) {
			const subject = subjects[Math.floor((day + i) % subjects.length)];
			const startTime = timeSlots[i] || '09:00';
			const [sh, sm] = startTime.split(':').map(Number);
			const endMin = sm + 45;
			const endH = sh + Math.floor(endMin / 60);
			const endM = endMin % 60;

			const date = new Date(weekStart);
			date.setDate(date.getDate() + day);

			blocks.push({
				id: crypto.randomUUID(),
				subject: subject.subject,
				topic: subject.topic,
				date,
				startTime,
				endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
				duration: 45,
				type: subject.score < 0.5 ? 'study' : 'practice',
				isCompleted: false,
				isAISuggested: true,
			});
		}
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
			current.date.toDateString() === next.date.toDateString() &&
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
