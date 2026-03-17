import { and, asc, eq, gte, like, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pastPaperQuestions, pastPapers } from '@/lib/db/schema';

interface SearchOptions {
	query: string;
	subject?: string;
	yearFrom?: number;
	yearTo?: number;
	topic?: string;
	limit?: number;
}

interface SearchResult {
	id: string;
	questionText: string;
	answerText: string | null;
	year: number;
	subject: string;
	paper: string | null;
	month: string | null;
	marks: number | null;
	questionNumber: number | null;
}

export async function searchPastPaperQuestions(options: SearchOptions): Promise<SearchResult[]> {
	const { query, subject, yearFrom, yearTo, topic, limit = 20 } = options;

	const conditions = [];

	if (subject) {
		conditions.push(eq(pastPaperQuestions.subject, subject));
	}

	if (topic) {
		conditions.push(like(pastPaperQuestions.topic, `%${topic}%`));
	}

	if (yearFrom) {
		conditions.push(gte(pastPaperQuestions.year, yearFrom));
	}

	if (yearTo) {
		conditions.push(lte(pastPaperQuestions.year, yearTo));
	}

	if (query) {
		conditions.push(sql`${pastPaperQuestions.questionText} ILIKE ${`%${query}%`}`);
	}

	const results = await db
		.select({
			id: pastPaperQuestions.id,
			questionText: pastPaperQuestions.questionText,
			answerText: pastPaperQuestions.answerText,
			year: pastPaperQuestions.year,
			subject: pastPaperQuestions.subject,
			paper: pastPaperQuestions.paper,
			month: pastPaperQuestions.month,
			marks: pastPaperQuestions.marks,
			questionNumber: pastPaperQuestions.questionNumber,
		})
		.from(pastPaperQuestions)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.limit(limit)
		.orderBy(asc(pastPaperQuestions.year), asc(pastPaperQuestions.questionNumber));

	return results;
}
