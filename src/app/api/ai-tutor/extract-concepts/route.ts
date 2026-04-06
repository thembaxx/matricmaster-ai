import { type NextRequest, NextResponse } from 'next/server';
import { generateAI } from '@/lib/ai-config';
import { getAuth } from '@/lib/auth';

interface Message {
	role: 'user' | 'assistant';
	content: string;
}

interface RequestBody {
	conversation: Message[];
	subject?: string;
}

interface ExtractedConcept {
	term: string;
	definition: string;
	context: string;
	suggestedTags: string[];
}

const EXTRACT_CONCEPTS_PROMPT = `You are an expert educational content analyzer for South African Matric (Grade 12) students.

## Your Task
Analyze the conversation below and extract key concepts that would make good flashcards.

## Output Format
Return a JSON array of concepts. Each concept must have:
- term: The key term or concept name (keep it concise, 1-5 words)
- definition: A clear, concise definition or explanation
- context: Brief context about where this concept appears in the conversation
- suggestedTags: Array of relevant topic/subject tags

## Guidelines
- Extract only the most important concepts (2-8 concepts max)
- Focus on definitions, formulas, key terms, and important relationships
- Keep definitions educational and exam-focused
- Use simple language appropriate for Grade 12 students
- Include relevant subject tags like: Mathematics, Physics, Chemistry, etc.

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

		const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
		if (!GEMINI_API_KEY) {
			return NextResponse.json(
				{ error: 'AI service not configured. Please set GEMINI_API_KEY.' },
				{ status: 500 }
			);
		}

		const body: RequestBody = await request.json();
		const { conversation, subject } = body;

		if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
			return NextResponse.json({ error: 'Conversation is required' }, { status: 400 });
		}

		const conversationText = conversation
			.map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
			.join('\n\n');

		const prompt = `${EXTRACT_CONCEPTS_PROMPT}

Subject: ${subject || 'General'}
Conversation:
${conversationText}

Extract key concepts now. Return only valid JSON.`;

		const responseText = await generateAI({ prompt });

		if (!responseText) {
			return NextResponse.json({ error: 'Failed to extract concepts' }, { status: 500 });
		}

		let jsonStr = responseText;
		const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
		if (jsonMatch) {
			jsonStr = jsonMatch[1].trim();
		}

		let concepts: ExtractedConcept[];
		try {
			concepts = JSON.parse(jsonStr);
		} catch (error) {
			console.debug('Failed to parse concepts JSON:', error);
			return NextResponse.json({ error: 'Failed to parse extracted concepts' }, { status: 500 });
		}

		if (!Array.isArray(concepts)) {
			return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
		}

		return NextResponse.json({
			concepts,
			subject,
		});
	} catch (error) {
		console.debug('Concept Extraction Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while extracting concepts' },
			{ status: 500 }
		);
	}
}
