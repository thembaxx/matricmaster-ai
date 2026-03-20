import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { generateWithMultimodal, generateWithOCR } from '@/lib/ai/provider';
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

		const ocrPrompt = `You are a professional Educational OCR Specialist. Your task is to analyze the provided image and extract all academic questions into a structured JSON format.

### Instructions:
1. **Identification:** Locate every question in the image. Include the original numbering (e.g., "Q1", "1.2").
2. **Structure:** Separate the question text from the options (for multiple-choice) or sub-questions.
3. **Accuracy:** Transcribe text exactly as written. For mathematical formulas, use LaTeX format (e.g., $x^2 + y^2 = r^2$).
4. **Context:** Identify the question type (MCQ, Short Answer, True/False).
5. **Diagrams:** If a question refers to a diagram or image, provide a brief "visual_description" of that element.

Analyze the image and extract all questions.`;

		const ocrResult = await generateWithOCR(ocrPrompt, [{ base64, mimeType: image.type }], {
			subject,
		});

		const solutionPrompt = `You are an expert Grade 12 tutor in South Africa. Analyze the image of this ${subject} question. 
        1. OCR the question text.
        2. Identify the core concepts involved.
        3. Provide a detailed, step-by-step solution aligned with the National Senior Certificate (NSC) curriculum.
        4. If it's a multiple choice question, explain why the correct option is right and others are wrong.
        Format the response in clear Markdown.`;

		const solution = await generateWithMultimodal(solutionPrompt, [
			{ base64, mimeType: image.type },
		]);

		return NextResponse.json({ questions: ocrResult.questions, solution });
	} catch (error) {
		console.debug('[Snap & Solve API Error]:', error);
		return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
	}
}
