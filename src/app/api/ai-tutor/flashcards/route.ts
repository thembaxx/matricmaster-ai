import { GoogleGenAI } from '@google/genai';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags: string[];
}

interface RequestBody {
	context: string;
	subject?: string;
	count?: number;
}

const FLASHCARD_PROMPT = `You are an expert flashcard creator for South African Matric (Grade 12) students.

## Output Format
Return a JSON array of flashcards. Each flashcard must have:
- id: A unique string identifier (e.g., "card1", "card2")
- front: The question or concept to remember (keep it concise)
- back: The answer or explanation (clear and educational)
- tags: An array of relevant topic tags

## Guidelines
- Keep front side brief (1-2 sentences max)
- Make back side informative but concise
- Use clear, simple language
- Include relevant formulas or definitions
- Focus on key concepts that are commonly tested in exams

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
		const { context, subject, count = 5 } = body;

		if (!context || context.trim().length === 0) {
			return NextResponse.json({ error: 'Context is required' }, { status: 400 });
		}

		const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

		const prompt = `${FLASHCARD_PROMPT}

Subject: ${subject || 'General'}
Number of flashcards: ${count}

Context from conversation:
${context}

Generate ${count} flashcards now. Return only valid JSON.`;

		const result = await genAI.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [
				{
					role: 'user',
					parts: [{ text: prompt }],
				},
			],
		});

		const responseText = result.text;

		if (!responseText) {
			return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
		}

		let jsonStr = responseText;
		const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
		if (jsonMatch) {
			jsonStr = jsonMatch[1].trim();
		}

		let flashcards: Flashcard[];
		try {
			flashcards = JSON.parse(jsonStr);
		} catch {
			console.error('Failed to parse flashcards JSON:', jsonStr);
			return NextResponse.json({ error: 'Failed to parse generated flashcards' }, { status: 500 });
		}

		if (!Array.isArray(flashcards)) {
			return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
		}

		return NextResponse.json({
			flashcards: flashcards.map((card, i) => ({
				...card,
				id: card.id || `card${i + 1}`,
			})),
			subject,
		});
	} catch (error) {
		console.error('Flashcard Generation Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while generating flashcards' },
			{ status: 500 }
		);
	}
}
