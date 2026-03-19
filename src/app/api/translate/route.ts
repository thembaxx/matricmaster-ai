import { GoogleGenerativeAI } from '@google/generative-ai';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const { text, targetLanguage, prompt } = await request.json();

		if (!text || !targetLanguage) {
			return NextResponse.json(
				{ error: 'Missing required fields: text, targetLanguage' },
				{ status: 400 }
			);
		}

		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			return NextResponse.json({ error: 'Translation service not configured' }, { status: 503 });
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

		const fullPrompt = `${prompt || 'Translate to'}: ${targetLanguage}\n\nText to translate: ${text}`;

		const result = await model.generateContent(fullPrompt);
		const translation = result.response.text();

		return NextResponse.json({ translation });
	} catch (error) {
		console.error('Translation error:', error);
		return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
	}
}
