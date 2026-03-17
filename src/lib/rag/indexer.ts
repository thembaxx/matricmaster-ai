import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pastPaperQuestions, pastPapers } from '@/lib/db/schema';

interface ExtractedQuestion {
	questionText: string;
	answerText?: string;
	questionNumber?: number;
	marks?: number;
}

export async function indexPastPaper(
	paperId: string,
	questions: ExtractedQuestion[]
): Promise<void> {
	const [paper] = await db.select().from(pastPapers).where(eq(pastPapers.id, paperId)).limit(1);

	if (!paper) {
		throw new Error('Paper not found');
	}

	for (const q of questions) {
		await db.insert(pastPaperQuestions).values({
			paperId,
			questionText: q.questionText,
			answerText: q.answerText,
			year: paper.year,
			subject: paper.subject,
			paper: paper.paper,
			month: paper.month,
			questionNumber: q.questionNumber,
			marks: q.marks,
		});
	}
}

export function parseQuestionsFromText(text: string): ExtractedQuestion[] {
	const questions: ExtractedQuestion[] = [];

	const lines = text.split('\n');
	let currentQuestion: ExtractedQuestion | null = null;

	for (const line of lines) {
		const questionMatch = line.match(/^(\d+)\.\s*(.+)/);

		if (questionMatch) {
			if (currentQuestion) {
				questions.push(currentQuestion);
			}
			currentQuestion = {
				questionNumber: Number.parseInt(questionMatch[1], 10),
				questionText: questionMatch[2].trim(),
			};
		} else if (currentQuestion && line.match(/^\s*\(?\d+\s*marks?\)?/i)) {
			const marksMatch = line.match(/(\d+)\s*marks?/i);
			if (marksMatch) {
				currentQuestion.marks = Number.parseInt(marksMatch[1], 10);
			}
		}
	}

	if (currentQuestion) {
		questions.push(currentQuestion);
	}

	return questions;
}
