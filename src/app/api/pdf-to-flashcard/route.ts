import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	generateFlashcardsBatchFromPdf,
	generateFlashcardsFromPdf,
	getPdfFlashcardDecks,
	type PdfPage,
} from '@/services/pdf-to-flashcard';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { action, pdfText, subject, paperName, topic, cardsPerPage, pdfPages } = body;

		if (action === 'generate') {
			if (!pdfText || !subject || !paperName) {
				return NextResponse.json(
					{ error: 'pdfText, subject, and paperName are required' },
					{ status: 400 }
				);
			}

			const result = await generateFlashcardsFromPdf(
				pdfText,
				subject,
				paperName,
				topic,
				cardsPerPage || 10
			);
			return NextResponse.json(result);
		}

		if (action === 'generateBatch') {
			if (!pdfPages || !Array.isArray(pdfPages) || !subject || !paperName) {
				return NextResponse.json(
					{ error: 'pdfPages array, subject, and paperName are required' },
					{ status: 400 }
				);
			}

			const result = await generateFlashcardsBatchFromPdf(
				pdfPages as PdfPage[],
				subject,
				paperName,
				topic,
				cardsPerPage || 10
			);
			return NextResponse.json(result);
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.debug('[PdfToFlashcard API] Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while processing your request' },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const decks = await getPdfFlashcardDecks();
		return NextResponse.json({ decks });
	} catch (error) {
		console.debug('[PdfToFlashcard API] Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while processing your request' },
			{ status: 500 }
		);
	}
}
