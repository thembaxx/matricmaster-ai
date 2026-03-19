import { type NextRequest, NextResponse } from 'next/server';
import { generateTextWithAI } from '@/lib/ai/provider';

export async function POST(request: NextRequest) {
	try {
		const { text, targetLanguage, prompt } = await request.json();

		if (!text || !targetLanguage) {
			return NextResponse.json(
				{ error: 'Missing required fields: text, targetLanguage' },
				{ status: 400 }
			);
		}

		const fullPrompt = `${prompt || 'Translate to'}: ${targetLanguage}\n\nText to translate: ${text}`;

		const translation = await generateTextWithAI({ prompt: fullPrompt });

		return NextResponse.json({ translation });
	} catch (error) {
		console.error('Translation error:', error);
		return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
	}
}
