'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { getExtractedQuestionsAction } from '@/lib/db/actions';

const quizGenerationSchema = z.object({
	paperId: z.string().min(1),
	questionIds: z.array(z.string()).optional(),
	settings: z
		.object({
			questionCount: z.number().int().min(1).max(50).optional(),
			timeLimit: z.number().int().min(5).max(180).optional(),
			shuffleQuestions: z.boolean().optional().default(true),
			showImmediateFeedback: z.boolean().optional().default(true),
		})
		.optional()
		.default({
			shuffleQuestions: true,
			showImmediateFeedback: true,
		}),
});

interface ExtractedOption {
	letter: string;
	text: string;
	isCorrect: boolean;
	explanation?: string;
}

interface ExtractedQuestion {
	id: string;
	questionNumber: string;
	questionText: string;
	options?: ExtractedOption[];
	subQuestions?: {
		id: string;
		text: string;
		marks?: number;
		options?: ExtractedOption[];
	}[];
	marks: number;
	topic?: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

interface ExtractedPaper {
	paperId: string;
	subject: string;
	paper: string;
	year: number;
	month: string;
	instructions?: string;
	questions: ExtractedQuestion[];
	markdownFileUrl?: string;
}

function estimateDifficulty(marks: number): 'easy' | 'medium' | 'hard' {
	if (marks <= 2) return 'easy';
	if (marks <= 4) return 'medium';
	return 'hard';
}

function transformToQuizQuestion(
	extracted: ExtractedQuestion,
	paper: ExtractedPaper
): {
	id: string;
	question: string;
	type: 'mcq' | 'shortAnswer';
	options?: Array<{ id: string; text: string; isCorrect: boolean }>;
	correctAnswer?: string;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	marks: number;
	source: { paperId: string; year: number; month: string; paper: string };
} {
	const difficulty = extracted.difficulty || estimateDifficulty(extracted.marks);

	if (extracted.options && extracted.options.length > 0) {
		return {
			id: extracted.id,
			question: extracted.questionText,
			type: 'mcq',
			options: extracted.options.map((opt, idx) => ({
				id: String.fromCharCode(65 + idx),
				text: opt.text,
				isCorrect: opt.isCorrect,
			})),
			correctAnswer: extracted.options.find((o) => o.isCorrect)?.letter,
			topic: extracted.topic || 'General',
			difficulty,
			marks: extracted.marks,
			source: {
				paperId: paper.paperId,
				year: paper.year,
				month: paper.month,
				paper: paper.paper,
			},
		};
	}

	return {
		id: extracted.id,
		question: extracted.questionText,
		type: 'shortAnswer',
		topic: extracted.topic || 'General',
		difficulty,
		marks: extracted.marks,
		source: {
			paperId: paper.paperId,
			year: paper.year,
			month: paper.month,
			paper: paper.paper,
		},
	};
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers as never });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const parsed = quizGenerationSchema.parse(body);
		const { paperId, questionIds, settings } = parsed;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'Database not available' }, { status: 503 });
		}

		const extractedJson = await getExtractedQuestionsAction(paperId);
		if (!extractedJson) {
			return NextResponse.json(
				{ error: 'No extracted questions found for this paper. Please extract questions first.' },
				{ status: 404 }
			);
		}

		const extractedPaper: ExtractedPaper = JSON.parse(extractedJson);
		let questions = extractedPaper.questions.map((q) => transformToQuizQuestion(q, extractedPaper));

		if (questionIds && questionIds.length > 0) {
			questions = questions.filter((q) => questionIds.includes(q.id));
		}

		if (questions.length === 0) {
			return NextResponse.json(
				{ error: 'No questions available for quiz generation' },
				{ status: 400 }
			);
		}

		if (settings.questionCount && settings.questionCount < questions.length) {
			questions = questions.slice(0, settings.questionCount);
		}

		if (settings.shuffleQuestions) {
			questions = questions.sort(() => Math.random() - 0.5);
		}

		const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
		const timeLimit = settings.timeLimit || Math.ceil(totalMarks * 1.5);

		const quiz = {
			id: `quiz-${paperId}-${Date.now()}`,
			title: `${extractedPaper.subject} - ${extractedPaper.paper} ${extractedPaper.year}`,
			subject: extractedPaper.subject,
			paperId: extractedPaper.paperId,
			year: extractedPaper.year,
			month: extractedPaper.month,
			paper: extractedPaper.paper,
			questions,
			settings: {
				shuffleQuestions: settings.shuffleQuestions ?? true,
				showImmediateFeedback: settings.showImmediateFeedback ?? true,
			},
			meta: {
				totalQuestions: questions.length,
				totalMarks,
				timeLimit,
				generatedFrom: paperId,
			},
		};

		return NextResponse.json({
			success: true,
			quiz,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
		}
		console.error('[QuizFromPastPaper] Generation error:', error);
		return NextResponse.json({ error: 'Failed to generate quiz from past paper' }, { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const paperId = searchParams.get('paperId');

		if (!paperId) {
			return NextResponse.json({ error: 'Missing required parameter: paperId' }, { status: 400 });
		}

		const extractedJson = await getExtractedQuestionsAction(paperId);
		if (!extractedJson) {
			return NextResponse.json(
				{ error: 'No extracted questions found for this paper' },
				{ status: 404 }
			);
		}

		const extractedPaper: ExtractedPaper = JSON.parse(extractedJson);

		const questions = extractedPaper.questions.map((q) => ({
			id: q.id,
			questionNumber: q.questionNumber,
			questionText: q.questionText,
			marks: q.marks,
			topic: q.topic || 'General',
			difficulty: q.difficulty || estimateDifficulty(q.marks),
			hasOptions: (q.options?.length ?? 0) > 0,
			subQuestionsCount: q.subQuestions?.length ?? 0,
		}));

		const topics = [...new Set(questions.map((q) => q.topic))];
		const difficulties = ['easy', 'medium', 'hard'];

		const byTopic = topics.reduce(
			(acc, topic) => {
				acc[topic] = questions.filter((q) => q.topic === topic).length;
				return acc;
			},
			{} as Record<string, number>
		);

		const byDifficulty = difficulties.reduce(
			(acc, diff) => {
				acc[diff] = questions.filter((q) => q.difficulty === diff).length;
				return acc;
			},
			{} as Record<string, number>
		);

		const byYear: Record<number, number> = {};
		byYear[extractedPaper.year] = questions.length;

		return NextResponse.json({
			success: true,
			paper: {
				paperId: extractedPaper.paperId,
				subject: extractedPaper.subject,
				paper: extractedPaper.paper,
				year: extractedPaper.year,
				month: extractedPaper.month,
			},
			questions,
			stats: {
				total: questions.length,
				byTopic,
				byDifficulty,
				byYear,
			},
		});
	} catch (error) {
		console.error('[QuizFromPastPaper] GET error:', error);
		return NextResponse.json({ error: 'Failed to get questions for quiz' }, { status: 500 });
	}
}
