import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { generateWithMultimodal, generateWithOCR } from '@/lib/ai/provider';
import { getAuth } from '@/lib/auth';

type SnapMode = 'full' | 'socratic' | 'hint';

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
		const languageContext = (formData.get('language') as string) || 'en';
		const mode = (formData.get('mode') as SnapMode) || 'full';
		const hintLevel = Number.parseInt(formData.get('hintLevel') as string, 10) || 1;

		if (!image) {
			return NextResponse.json({ error: 'No image provided' }, { status: 400 });
		}

		const maxSize = 10 * 1024 * 1024;
		if (image.size > maxSize) {
			return NextResponse.json(
				{ error: 'Image too large. Maximum size is 10MB.' },
				{ status: 400 }
			);
		}

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(image.type)) {
			return NextResponse.json(
				{ error: 'Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed.' },
				{ status: 400 }
			);
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

		const ocrResult = await generateWithOCR(ocrPrompt, [{ base64, mimeType: image.type }]);

		let solutionPrompt: string;

		if (mode === 'socratic') {
			solutionPrompt = `You are a Socratic tutor helping a Grade 12 South African student. Instead of giving the answer, guide them to discover it themselves.

### Instructions:
1. Start with a gentle hint that helps them identify what they already know.
2. Ask a probing question that leads them closer to the solution.
3. If hintLevel=1: Give a broad conceptual hint.
4. If hintLevel=2: Give a more specific hint pointing toward the approach.
5. If hintLevel=3: Give a near-complete hint that almost reveals the answer.
6. NEVER give the final answer - always guide them to figure it out themselves.
7. Encourage critical thinking about ${subject} concepts from the NSC curriculum.

Use a supportive, encouraging tone.`;
		} else if (mode === 'hint') {
			const hintDepth =
				[
					'Start by identifying what the question is asking',
					'Think about the key formula or concept needed',
					'Consider breaking this into smaller steps',
				][hintLevel - 1] || 'Start by identifying what the question is asking';

			solutionPrompt = `You are a Grade 12 ${subject} tutor in South Africa. Provide a brief hint to guide the student without giving the full answer.

### Instructions:
1. Give a single ${hintDepth.toLowerCase()}.
2. Do NOT solve the problem - just guide them on how to start.
3. Keep it to 2-3 sentences maximum.
4. Align with NSC ${subject} curriculum.`;
		} else {
			solutionPrompt = `You are an expert Grade 12 tutor in South Africa. Analyze the image of this ${subject} question. 
        1. OCR the question text.
        2. Identify the core concepts involved.
        3. Provide a detailed, step-by-step solution aligned with the National Senior Certificate (NSC) curriculum.
        4. If it's a multiple choice question, explain why the correct option is right and others are wrong.
        Format the response in clear Markdown.`;
		}

		const languageBoundPrompt =
			languageContext === 'af'
				? solutionPrompt +
					'\n\nIMPORTANT: Provide your response entirely in Afrikaans if the student selected Afrikaans.'
				: solutionPrompt;

		const solution = await generateWithMultimodal(languageBoundPrompt, [
			{ base64, mimeType: image.type },
		]);

		return NextResponse.json({
			questions: ocrResult.questions,
			solution,
			mode,
		});
	} catch (error) {
		console.debug('[Snap & Solve API Error]:', error);
		return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
	}
}
