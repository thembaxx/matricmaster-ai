import { type NextRequest, NextResponse } from 'next/server';
import { searchPastPaperQuestions } from '@/lib/rag/search';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { query, subject, yearFrom, yearTo, topic, limit } = body;

		if (!query && !topic) {
			return NextResponse.json({ error: 'Query or topic required' }, { status: 400 });
		}

		const results = await searchPastPaperQuestions({
			query,
			subject,
			yearFrom,
			yearTo,
			topic,
			limit: limit || 20,
		});

		return NextResponse.json({ results });
	} catch (error) {
		console.error('Search error:', error);
		return NextResponse.json({ error: 'Search failed' }, { status: 500 });
	}
}
