import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractedPaperSchema } from '@/services/pdfExtractor';

const practiceJsonSchema = z.object({
	papers: z.array(
		z.object({
			id: z.string(),
			title: z.string(),
			subject: z.string(),
			year: z.number(),
			session: z.string(),
			paper: z.string(),
			questions: z.array(extractedPaperSchema.shape.questions.element).min(1),
			isExtracted: z.boolean(),
			extractionDate: z.string().optional(),
			extractionError: z.string().optional(),
			extractionTime: z.number().optional(),
			extractionCacheKey: z.string().optional(),
			extractionCacheHit: z.boolean().optional(),
		})
	),
});

export async function validatePracticeJson(request: Request) {
	try {
		const json = await request.json();
		const validated = practiceJsonSchema.parse(json);

		// Check for missing memos
		const missingMemos = validated.papers.filter((paper) => paper.questions.some((q) => !q.memo));

		if (missingMemos.length > 0) {
			console.warn(`Missing memos in papers: ${missingMemos.map((p) => p.id).join(', ')}`);
		}

		return NextResponse.json({ validated: true, missingMemos }, { status: 200 });
	} catch (error) {
		const err = error as { name?: string; errors?: unknown[] };
		if (err.name === 'ZodError') {
			console.error('Schema validation failed:', err.errors);
			return NextResponse.json(
				{
					validated: false,
					errors: err.errors,
					message: 'Schema validation failed',
				},
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{
				validated: false,
				message: 'Validation error',
			},
			{ status: 500 }
		);
	}
}
