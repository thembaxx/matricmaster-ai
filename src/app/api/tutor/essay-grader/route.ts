import { type NextRequest, NextResponse } from 'next/server';
import { generateAI } from '@/lib/ai-config';
import { getAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface EssayRequest {
	essay: string;
	topic: string;
	subject?: string;
	wordCount?: number;
}

const ESSAY_GRADER_PROMPT = `You are an expert educator and examiner for South African Matric (Grade 12) students.

## Your Task
Grade the student's essay and provide detailed, constructive feedback.

## Grading Criteria
1. **Content & Relevance** (0-25 marks): How well does the essay address the topic?
2. **Structure & Organization** (0-25 marks): Introduction, body paragraphs, conclusion
3. **Argument & Analysis** (0-25 marks): Critical thinking, evidence, reasoning
4. **Language & Style** (0-25 marks): Grammar, vocabulary, clarity

## Output Format
Return a JSON object with:
- totalScore: number (0-100)
- breakdown: object with scores for each criterion
- strengths: array of strings (what was done well)
- improvements: array of strings (specific suggestions)
- detailedFeedback: string (overall comments)
- suggestedGrade: string (A+, A, B+, B, C+, C, D, E, F)

Return ONLY valid JSON, no markdown.`;

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body: EssayRequest = await request.json();
		const { essay, topic, subject, wordCount } = body;

		if (!essay || essay.trim().length < 50) {
			return NextResponse.json({ error: 'Essay must be at least 50 characters' }, { status: 400 });
		}

		const prompt = `${ESSAY_GRADER_PROMPT}

## Essay Details
- Topic: ${topic}
- Subject: ${subject || 'General'}
- Word Count: ${wordCount || essay.split(' ').length}

## Student's Essay
${essay}

Now grade this essay and return the JSON feedback.`;

		const responseText = await generateAI({ prompt });

		if (!responseText) {
			return NextResponse.json({ error: 'Failed to grade essay' }, { status: 500 });
		}

		const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
		let gradingResult: Record<string, unknown> | null = null;
		try {
			const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText;
			gradingResult = JSON.parse(jsonStr);
		} catch {
			console.error('Failed to parse grading JSON:', responseText);
			return NextResponse.json({ error: 'Failed to parse grading result' }, { status: 500 });
		}

		return NextResponse.json({
			topic,
			subject,
			wordCount: essay.split(' ').length,
			grading: gradingResult,
			evaluatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Essay grading error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while grading your essay' },
			{ status: 500 }
		);
	}
}
