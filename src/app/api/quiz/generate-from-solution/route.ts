'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AI_MODELS, generateAI } from '@/lib/ai-config';

const quizGenerationSchema = z.object({
	solution: z.string().min(1).max(10000),
	subject: z.string().min(1).max(100),
});

function cleanJson(text: string): string {
	return text.replace(/```json\n?|```/g, '').trim();
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { solution, subject } = quizGenerationSchema.parse(body);

		const prompt = `You are a Grade 12 teacher in South Africa. Based on the following solution/explanation, generate 5 multiple choice questions to test the student's understanding. 

Solution:
${solution}

Subject: ${subject}

Generate questions that test the key concepts from this solution. Return a JSON array with this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct",
    "topic": "Key topic name"
  }
]

IMPORTANT: correctAnswer should be the index (0-3) of the correct option.`;

		const result = await generateAI({ prompt, model: AI_MODELS.PRIMARY });

		if (!result) {
			return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
		}

		const cleaned = cleanJson(result);
		const questions = JSON.parse(cleaned);

		const quizId = `quiz-${Date.now()}-${Math.random().toString(36).substring(7)}`;

		return NextResponse.json({
			quizId,
			questions,
			subject,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
		}
		console.error('Quiz generation error:', error);
		return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
	}
}
