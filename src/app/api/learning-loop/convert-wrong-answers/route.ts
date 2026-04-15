import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAI } from '@/lib/ai-config';
import { getAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { options, questions } from '@/lib/db/schema';

const convertWrongAnswersSchema = z.object({
	quizId: z.string().min(1, 'quizId is required'),
	questionIds: z.array(z.string().uuid()).min(1, 'At least one questionId is required'),
});

const EXPLANATION_PROMPT = `You are an expert South African Matric (Grade 12) tutor.

## Your Task
Generate a clear, educational explanation for the following question that was answered incorrectly.

## Guidelines
- Explain WHY the correct answer is correct
- Identify common misconceptions that lead to wrong answers
- Use simple, exam-focused language suitable for Grade 12 students
- Include relevant formulas or key concepts
- Keep explanations concise but comprehensive (2-4 paragraphs)
- Format with clear structure using markdown

## Question
{questionText}

## Options
{options}

Provide the explanation now. Return ONLY valid markdown text, no markdown code blocks or additional formatting.`;

interface QuestionWithOptions {
	id: string;
	questionText: string;
	topic: string;
	subjectId: number;
	options: { optionLetter: string; optionText: string; isCorrect: boolean }[];
}

async function getQuestionsWithOptions(questionIds: string[]): Promise<QuestionWithOptions[]> {
	const db = await getDb();

	const questionsData = await db
		.select({
			id: questions.id,
			questionText: questions.questionText,
			topic: questions.topic,
			subjectId: questions.subjectId,
		})
		.from(questions)
		.where(
			// @ts-expect-error - drizzle ORM inference
			questions.id.in(questionIds)
		);

	const questionsWithOptions: QuestionWithOptions[] = [];

	for (const q of questionsData) {
		const opts = await db
			.select({
				optionLetter: options.optionLetter,
				optionText: options.optionText,
				isCorrect: options.isCorrect,
			})
			.from(options)
			.where(
				// @ts-expect-error - drizzle ORM inference
				options.questionId.eq(q.id)
			);

		questionsWithOptions.push({
			...q,
			options: opts,
		});
	}

	return questionsWithOptions;
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validation = convertWrongAnswersSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const { quizId, questionIds } = validation.data;
		const userId = session.user.id;

		console.debug('[convert-wrong-answers] Processing:', {
			quizId,
			questionIds: questionIds.length,
			userId,
		});

		const questionsWithOptions = await getQuestionsWithOptions(questionIds);

		if (questionsWithOptions.length === 0) {
			return NextResponse.json({ error: 'No valid questions found' }, { status: 404 });
		}

		const explanations: {
			questionId: string;
			questionText: string;
			topic: string;
			explanation: string;
		}[] = [];

		const aiSessionId = `ll-${Date.now()}-${userId.slice(0, 8)}`;

		for (const q of questionsWithOptions) {
			const optionsText = q.options
				.map((opt) => `${opt.optionLetter}) ${opt.optionText}${opt.isCorrect ? ' [CORRECT]' : ''}`)
				.join('\n');

			const prompt = EXPLANATION_PROMPT.replace('{questionText}', q.questionText).replace(
				'{options}',
				optionsText
			);

			const explanationText = await generateAI({ prompt });

			explanations.push({
				questionId: q.id,
				questionText: q.questionText,
				topic: q.topic,
				explanation: explanationText || 'Explanation could not be generated.',
			});

			console.debug('[convert-wrong-answers] Generated explanation for question:', q.id);
		}

		const db = await getDb();

		try {
			await db.execute(`
				INSERT INTO learning_loop_events (
					id, user_id, quiz_id, question_id, flashcard_deck_id, 
					ai_session_id, outcome, triggered_by, created_at
				) VALUES (
					${`'${aiSessionId}'`}, ${`'${userId}'`}, ${`'${quizId}'`}, NULL, NULL, 
					${`'${aiSessionId}'`}, ${`'explanation_generated'`}, ${`'learning-loop'`}, NOW()
				)
			`);
			console.debug('[convert-wrong-answers] Logged event to learningLoopEvents');
		} catch (dbError) {
			console.debug(
				'[convert-wrong-answers] learningLoopEvents table not available, skipping log:',
				dbError
			);
		}

		return NextResponse.json({
			success: true,
			aiSessionId,
			explanations,
			count: explanations.length,
		});
	} catch (error) {
		console.debug('[convert-wrong-answers] Error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to convert wrong answers' },
			{ status: 500 }
		);
	}
}
