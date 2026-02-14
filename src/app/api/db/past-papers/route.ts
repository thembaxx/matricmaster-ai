import { type NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Retrieve a past paper by paperId
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const paperId = searchParams.get('paperId');

		if (!paperId) {
			return NextResponse.json({ error: 'Missing required parameter: paperId' }, { status: 400 });
		}

		const databaseUrl = getEnv('DATABASE_URL');
		if (!databaseUrl) {
			return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
		}

		// Query the database directly
		const response = await fetch(
			`${databaseUrl}/rest/v1/past_papers?paper_id=eq.${encodeURIComponent(paperId)}&select=*`,
			{
				headers: {
					'Content-Type': 'application/json',
					apikey: databaseUrl.split('@')[1]?.split('/')[2] || '',
					Authorization: `Bearer ${databaseUrl.split('@')[1]?.split('/')[2] || ''}`,
				},
			}
		);

		if (!response.ok) {
			console.error('[API] Database query failed:', response.status);
			return NextResponse.json({ paper: null });
		}

		const data = await response.json();
		return NextResponse.json({ paper: data[0] || null });
	} catch (error) {
		console.error('[API] Error fetching past paper:', error);
		return NextResponse.json({ error: 'Failed to fetch past paper' }, { status: 500 });
	}
}

// POST - Create or update a past paper
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			paperId,
			originalPdfUrl,
			storedPdfUrl,
			subject,
			paper,
			year,
			month,
			isExtracted,
			extractedQuestions,
			instructions,
		} = body;

		if (!paperId || !originalPdfUrl || !subject || !paper || !year || !month) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const databaseUrl = getEnv('DATABASE_URL');
		if (!databaseUrl) {
			return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
		}

		// For now, use a simpler approach - upsert using POST with on_conflict
		const upsertResponse = await fetch(`${databaseUrl}/rest/v1/past_papers`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Prefer: 'resolution=merge-duplicates',
			},
			body: JSON.stringify({
				paper_id: paperId,
				original_pdf_url: originalPdfUrl,
				stored_pdf_url: storedPdfUrl,
				subject,
				paper,
				year,
				month,
				is_extracted: isExtracted,
				extracted_questions: extractedQuestions,
				instructions,
				updated_at: new Date().toISOString(),
			}),
		});

		if (!upsertResponse.ok) {
			const errorText = await upsertResponse.text();
			console.error('[API] Database insert failed:', upsertResponse.status, errorText);
			return NextResponse.json(
				{ error: 'Failed to save past paper', details: errorText },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[API] Error saving past paper:', error);
		return NextResponse.json({ error: 'Failed to save past paper' }, { status: 500 });
	}
}
