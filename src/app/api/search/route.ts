import { NextResponse } from 'next/server';
import { QUIZ_DATA } from '@/constants/quiz-data';
import type { PastPaper } from '@/lib/db/schema';

// Helper to convert Quiz Data to PastPaper format for search results
function mapQuizDataToPastPapers(query: string): PastPaper[] {
	const normalizedQuery = query.toLowerCase();
	const results: PastPaper[] = [];

	Object.entries(QUIZ_DATA).forEach(([key, data]) => {
		// Search in title, subject, year, questions text
		const searchableText =
			`${data.title} ${data.subject} ${data.year} ${data.session} ${data.paper}`.toLowerCase();
		const questionMatches = data.questions.some(
			(q) =>
				q.question.toLowerCase().includes(normalizedQuery) ||
				q.topic.toLowerCase().includes(normalizedQuery) ||
				q.subtopic.toLowerCase().includes(normalizedQuery)
		);

		if (searchableText.includes(normalizedQuery) || questionMatches) {
			results.push({
				id: key,
				paperId: key,
				subject: data.subject,
				paper: `Paper ${data.paper}`,
				year: data.year,
				month: data.session,
				originalPdfUrl: '#', // Placeholder
				isExtracted: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				storedPdfUrl: null,
				markdownFileUrl: null,
				extractedQuestions: JSON.stringify(data.questions),
				instructions: null,
				totalMarks: null,
			});
		}
	});

	return results;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get('q');

	if (!query) {
		return NextResponse.json({ results: [] });
	}

	const results = mapQuizDataToPastPapers(query);

	return NextResponse.json({ results });
}
