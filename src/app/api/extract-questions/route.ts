import { type NextRequest, NextResponse } from 'next/server';
import { extractQuestionsFromPDF, getCachedQuestions } from '@/services/pdfExtractor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { paperId, pdfUrl, subject, paper, year, month } = body;

		// Validate required fields
		if (!paperId || !pdfUrl || !subject || !paper || !year || !month) {
			return NextResponse.json(
				{ error: 'Missing required fields: paperId, pdfUrl, subject, paper, year, month' },
				{ status: 400 }
			);
		}

		console.log(`[API] Extracting questions for paper: ${paperId}`);

		// Check for cached questions first
		const cached = await getCachedQuestions(paperId);
		if (cached && Object.keys(cached).length > 0) {
			return NextResponse.json({
				success: true,
				data: cached,
				cached: true,
			});
		}

		// Extract questions from PDF
		const extractedPaper = await extractQuestionsFromPDF(
			paperId,
			pdfUrl,
			subject,
			paper,
			year,
			month
		);

		if (!extractedPaper || Object.keys(extractedPaper).length === 0) {
			console.log('Failed to extract questions');

			return NextResponse.json(
				{
					error: 'Failed to extract questions',
					details: 'Empty data',
				},
				{ status: 500 }
			);
		}
		return NextResponse.json({
			success: true,
			data: extractedPaper,
			cached: false,
		});
	} catch (error) {
		console.error('[API] Error extracting questions:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

		return NextResponse.json(
			{
				error: 'Failed to extract questions',
				details: errorMessage,
			},
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const paperId = searchParams.get('paperId');

	if (!paperId) {
		return NextResponse.json({ error: 'Missing required parameter: paperId' }, { status: 400 });
	}

	// Check for cached questions
	const cached = getCachedQuestions(paperId);
	if (cached) {
		return NextResponse.json({
			success: true,
			data: cached,
			cached: true,
		});
	}

	return NextResponse.json({ error: 'No cached questions found for this paper' }, { status: 404 });
}
