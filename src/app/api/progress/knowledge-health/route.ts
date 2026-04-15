import { and, desc, eq, gte } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import {
	flashcardDecks,
	flashcardReviews,
	flashcards,
	quizResults,
	subjects,
} from '@/lib/db/schema';

interface SubjectBreakdown {
	subjectId: number;
	subjectName: string;
	quizAccuracy: number;
	flashcardRetention: number;
	knowledgeHealthScore: number;
}

interface KnowledgeHealthResult {
	overallScore: number;
	quizAccuracy: number;
	flashcardRetention: number;
	subjectBreakdown: SubjectBreakdown[];
	calculatedAt: string;
}

async function calculateQuizAccuracy(
	userId: string,
	daysBack = 30
): Promise<{ overall: number; bySubject: Map<number, { correct: number; total: number }> }> {
	const db = await getDb();
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysBack);

	const results = await db
		.select({
			subjectId: quizResults.subjectId,
			score: quizResults.score,
			totalQuestions: quizResults.totalQuestions,
		})
		.from(quizResults)
		.where(and(eq(quizResults.userId, userId), gte(quizResults.completedAt, cutoffDate)))
		.orderBy(desc(quizResults.completedAt));

	let totalCorrect = 0;
	let totalQuestions = 0;
	const bySubject = new Map<number, { correct: number; total: number }>();

	for (const r of results) {
		if (r.subjectId === null) continue;

		const current = bySubject.get(r.subjectId) || { correct: 0, total: 0 };
		current.correct += r.score ?? 0;
		current.total += r.totalQuestions ?? 0;
		bySubject.set(r.subjectId, current);

		totalCorrect += r.score ?? 0;
		totalQuestions += r.totalQuestions ?? 0;
	}

	const overall = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

	return { overall, bySubject };
}

async function calculateFlashcardRetention(userId: string): Promise<{
	overall: number;
	bySubject: Map<number, { easy: number; good: number; total: number }>;
}> {
	const db = await getDb();

	const reviews = await db
		.select({
			rating: flashcardReviews.rating,
			deckId: flashcards.deckId,
		})
		.from(flashcardReviews)
		.innerJoin(flashcards, eq(flashcardReviews.flashcardId, flashcards.id))
		.innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
		.where(eq(flashcardDecks.userId, userId))
		.orderBy(desc(flashcardReviews.reviewedAt))
		.limit(500);

	let easyOrGood = 0;
	let total = 0;
	const bySubject = new Map<number, { easy: number; good: number; total: number }>();

	for (const r of reviews) {
		const rating = r.rating ?? 0;
		const isEasyOrGood = rating >= 3;

		if (isEasyOrGood) easyOrGood++;
		total++;
	}

	const overall = total > 0 ? Math.round((easyOrGood / total) * 100) : 0;

	return { overall, bySubject };
}

export async function GET(_request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;

		console.debug('[knowledge-health] Calculating for user:', userId);

		const quizData = await calculateQuizAccuracy(userId, 30);
		const flashcardData = await calculateFlashcardRetention(userId);

		const quizAccuracy = quizData.overall;
		const flashcardRetention = flashcardData.overall;

		const overallScore = Math.round(quizAccuracy * 0.6 + flashcardRetention * 0.4);

		const allSubjects = await getDb().then((db) =>
			db
				.select({ id: subjects.id, name: subjects.name, displayName: subjects.displayName })
				.from(subjects)
				.where(
					// @ts-expect-error - drizzle ORM inference
					subjects.isActive.eq(true)
				)
				.orderBy(subjects.displayOrder)
		);

		const subjectBreakdown: SubjectBreakdown[] = [];

		for (const subject of allSubjects) {
			const quizStats = quizData.bySubject.get(Number(subject.id));
			const subjectQuizAccuracy =
				quizStats && quizStats.total > 0
					? Math.round((quizStats.correct / quizStats.total) * 100)
					: 0;

			const subjectFlashcardRetention = 0;

			const subjectScore = Math.round(subjectQuizAccuracy * 0.6 + subjectFlashcardRetention * 0.4);

			subjectBreakdown.push({
				subjectId: Number(subject.id),
				subjectName: subject.displayName || subject.name,
				quizAccuracy: subjectQuizAccuracy,
				flashcardRetention: subjectFlashcardRetention,
				knowledgeHealthScore: subjectScore,
			});
		}

		const result: KnowledgeHealthResult = {
			overallScore,
			quizAccuracy,
			flashcardRetention,
			subjectBreakdown,
			calculatedAt: new Date().toISOString(),
		};

		console.debug('[knowledge-health] Result:', {
			overallScore,
			quizAccuracy,
			flashcardRetention,
			subjectsCovered: subjectBreakdown.length,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.debug('[knowledge-health] Error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to calculate knowledge health' },
			{ status: 500 }
		);
	}
}
