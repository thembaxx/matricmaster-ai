import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface RequestBody {
	message: string;
	subject?: string | null;
	history?: ChatMessage[];
}

const systemPrompt = `You are an expert South African Matriculation (Grade 12) study tutor. Your role is to help students master their subjects through clear explanations, step-by-step guidance, and practice problems.

## Your Expertise
- Mathematics (Calculus, Algebra, Geometry, Trigonometry, Statistics)
- Physical Sciences (Physics, Chemistry)
- Life Sciences (Biology)
- Accounting, Economics, Geography, History
- English Home Language

## Teaching Approach
1. **Clear Explanations**: Break down complex concepts into simple, understandable parts
2. **Step-by-Step Solutions**: Show your work, especially for math and science problems
3. **Examples**: Provide relevant examples to illustrate points
4. **Encouragement**: Motivate students and celebrate their progress
5. **Socratic Method**: Ask guiding questions to help students discover answers themselves

## Guidelines
- Always be patient and encouraging
- Use South African exam context where relevant (NSC papers, CAPS curriculum)
- Provide worked examples from typical exam questions
- If you don't know something, admit it and suggest where to find the answer
- Format mathematical expressions clearly using plain text or basic symbols
- Keep explanations concise but complete

## Response Format
- Use friendly, conversational tone
- Structure longer responses with headings
- Use bullet points for lists
- Include practice problems when appropriate
- End with encouraging words or next steps

Remember: Your goal is to help students succeed in their Matric exams!`;

export async function POST(request: NextRequest) {
	try {
		if (!GEMINI_API_KEY) {
			return NextResponse.json(
				{ error: 'AI service not configured. Please set GEMINI_API_KEY.' },
				{ status: 500 }
			);
		}

		const body: RequestBody = await request.json();
		const { message, subject, history } = body;

		if (!message || message.trim().length === 0) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

		// Build conversation context
		const conversationParts: { role: string; parts: { text: string }[] }[] = [];

		// Add system prompt as first message
		conversationParts.push({
			role: 'user',
			parts: [{ text: systemPrompt }],
		});

		// Add previous conversation history (limit to last 10 messages to save tokens)
		if (history && history.length > 0) {
			const recentHistory = history.slice(-10);
			for (const msg of recentHistory) {
				conversationParts.push({
					role: msg.role,
					parts: [{ text: msg.content }],
				});
			}
		}

		// Add current message with subject context
		const contextualMessage = subject
			? `[Subject: ${subject}] ${message}`
			: message;

		conversationParts.push({
			role: 'user',
			parts: [{ text: contextualMessage }],
		});

		const result = await genAI.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: conversationParts,
		});

		const response = result.text;

		if (!response) {
			return NextResponse.json(
				{ error: 'Failed to generate response' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ response });
	} catch (error) {
		console.error('AI Tutor Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while processing your request' },
			{ status: 500 }
		);
	}
}
