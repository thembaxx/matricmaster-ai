import { GoogleGenAI } from '@google/genai';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const formData = await req.formData();
		const image = formData.get('image') as File;
		const subject = (formData.get('subject') as string) || 'General';

		if (!image) {
			return NextResponse.json({ error: 'No image provided' }, { status: 400 });
		}

		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
		}

		const genAI = new GoogleGenAI({ apiKey });

		const buffer = await image.arrayBuffer();
		const base64 = Buffer.from(buffer).toString('base64');

		const prompt = `You are an expert Grade 12 tutor in South Africa. Analyze the image of this ${subject} question. 
        1. OCR the question text.
        2. Identify the core concepts involved.
        3. Provide a detailed, step-by-step solution aligned with the National Senior Certificate (NSC) curriculum.
        4. If it's a multiple choice question, explain why the correct option is right and others are wrong.
        Format the response in clear Markdown.`;

		const result = await genAI.models.generateContent({
			model: 'gemini-2.0-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{ text: prompt },
						{
							inlineData: {
								data: base64,
								mimeType: image.type,
							},
						},
					],
				},
			],
		});

		const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

		return NextResponse.json({ solution: text });
	} catch (error) {
		console.error('[Snap & Solve API Error]:', error);
		return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
	}
}
