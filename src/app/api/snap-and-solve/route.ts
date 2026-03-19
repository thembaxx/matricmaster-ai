import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { generateWithMultimodal } from '@/lib/ai/provider';
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

		const buffer = await image.arrayBuffer();
		const base64 = Buffer.from(buffer).toString('base64');

		const prompt = `You are an expert Grade 12 tutor in South Africa. Analyze the image of this ${subject} question. 
        1. OCR the question text.
        2. Identify the core concepts involved.
        3. Provide a detailed, step-by-step solution aligned with the National Senior Certificate (NSC) curriculum.
        4. If it's a multiple choice question, explain why the correct option is right and others are wrong.
        Format the response in clear Markdown.`;

		const solution = await generateWithMultimodal(prompt, [{ base64, mimeType: image.type }]);

		return NextResponse.json({ solution });
	} catch (error) {
		console.debug('[Snap & Solve API Error]:', error);
		return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
	}
}
