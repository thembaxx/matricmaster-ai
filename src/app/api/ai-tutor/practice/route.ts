import { type NextRequest, NextResponse } from 'next/server';
import { generateAI } from '@/lib/ai-config';
import { getAuth } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface PracticeProblem {
	id: string;
	question: string;
	type: 'multiple-choice' | 'short-answer' | 'step-by-step';
	options?: string[];
	answer: string;
	explanation: string;
}

interface RequestBody {
	context: string;
	subject?: string;
	difficulty?: 'easy' | 'medium' | 'hard';
	count?: number;
}

const PRACTICE_PROMPT = `You are an expert South African Matriculation exam question generator. Generate practice problems based on the given context.

## Output Format
Return a JSON array of practice problems. Each problem must have:
- id: A unique string identifier (e.g., "q1", "q2")
- question: The problem statement
- type: One of "multiple-choice", "short-answer", or "step-by-step"
- options: For multiple-choice, provide 4 options as an array
- answer: The correct answer
- explanation: A brief explanation of how to solve it

## Guidelines
- Questions should match the difficulty level specified
- For math/science, use clear notation and show step-by-step solutions where appropriate
- Make questions relevant to South African NSC/CAPS curriculum
- Ensure answers are accurate and well-explained

Return ONLY valid JSON, no markdown or additional text.`;

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (!GEMINI_API_KEY) {
			return NextResponse.json(
				{ error: 'AI service not configured. Please set GEMINI_API_KEY.' },
				{ status: 500 }
			);
		}

		const body: RequestBody = await request.json();
		const { context, subject, difficulty = 'medium', count = 3 } = body;

		if (!context || context.trim().length === 0) {
			return NextResponse.json({ error: 'Context is required' }, { status: 400 });
		}

		const prompt = `${PRACTICE_PROMPT}

Subject: ${subject || 'General'}
Difficulty: ${difficulty}
Number of questions: ${count}

Context from conversation:
${context}

Generate ${count} practice problems now. Return only valid JSON.`;

		const responseText = await generateAI({ prompt });

		if (!responseText) {
			return NextResponse.json({ error: 'Failed to generate problems' }, { status: 500 });
		}

		let jsonStr = responseText;
		const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
		if (jsonMatch) {
			jsonStr = jsonMatch[1].trim();
		}

		let problems: PracticeProblem[];
		try {
			problems = JSON.parse(jsonStr);
		} catch {
			console.debug('Failed to parse practice problems JSON:', jsonStr);
			return NextResponse.json({ error: 'Failed to parse generated problems' }, { status: 500 });
		}

		if (!Array.isArray(problems)) {
			return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
		}

		return NextResponse.json({
			problems: problems.map((p, i) => ({
				...p,
				id: p.id || `q${i + 1}`,
			})),
			difficulty,
			subject,
		});
	} catch (error) {
		console.debug('Practice Problem Generation Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while generating practice problems' },
			{ status: 500 }
		);
	}
}
