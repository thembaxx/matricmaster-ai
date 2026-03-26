'use server';

import { and, desc, eq, isNull, lte, or } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { flashcardDecks, flashcards, pastPapers, studySessions } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

interface OfflineContent {
	id: string;
	type: 'quiz' | 'flashcard' | 'paper' | 'notes';
	title: string;
	subject: string;
	estimatedDuration: number;
	contentUrl?: string;
	sizeEstimate: number;
}

interface PreDownloadPlan {
	beforeLoadShedding: OfflineContent[];
	duringLoadShedding: OfflineContent[];
	totalSizeMB: number;
	estimatedOfflineHours: number;
}

/**
 * Generate a list of offline content to download before predicted load shedding
 */
export async function generatePreDownloadPlan(
	affectedBlocks: Array<{ date: string; startTime: string; endTime: string }>
): Promise<PreDownloadPlan> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return {
				beforeLoadShedding: [],
				duringLoadShedding: [],
				totalSizeMB: 0,
				estimatedOfflineHours: 0,
			};
		}

		const db = await getDb();
		const userId = session.user.id;

		// Calculate offline hours
		const offlineHours = affectedBlocks.reduce((total, block) => {
			const start = Number.parseInt(block.startTime.split(':')[0], 10);
			const end = Number.parseInt(block.endTime.split(':')[0], 10);
			return total + Math.max(0, end - start);
		}, 0);

		// Get user's flashcard decks
		const decks = await db.query.flashcardDecks.findMany({
			where: eq(flashcardDecks.userId, userId),
		});

		const deckIds = decks.map((d) => d.id);

		// Get flashcards due for review
		const now = new Date();
		const dueFlashcards: Array<{
			id: string;
			front: string;
			deckId: string;
			nextReview: Date | null;
		}> = [];

		for (const deckId of deckIds) {
			const cards = await db.query.flashcards.findMany({
				where: and(
					eq(flashcards.deckId, deckId),
					or(lte(flashcards.nextReview, now), isNull(flashcards.nextReview))
				),
				orderBy: [desc(flashcards.nextReview)],
				limit: 10,
			});
			dueFlashcards.push(...cards);
		}

		// Get recent study sessions (quiz history)
		const recentSessions = await db.query.studySessions.findMany({
			where: and(eq(studySessions.userId, userId), eq(studySessions.sessionType, 'quiz')),
			orderBy: [desc(studySessions.startedAt)],
			limit: 5,
		});

		// Get past papers
		const papers = await db.query.pastPapers.findMany({
			where: eq(pastPapers.isExtracted, true),
			limit: 10,
		});

		const beforeLoadShedding: OfflineContent[] = [];
		const duringLoadShedding: OfflineContent[] = [];

		// Prioritize flashcard reviews (small size, high value)
		for (const card of dueFlashcards.slice(0, 10)) {
			const deck = decks.find((d) => d.id === card.deckId);
			beforeLoadShedding.push({
				id: card.id,
				type: 'flashcard',
				title: `Review: ${card.front.substring(0, 50)}...`,
				subject: deck?.name || 'General',
				estimatedDuration: 2,
				sizeEstimate: 0.01,
			});
		}

		// Add quiz sessions for offline practice
		for (const session of recentSessions.slice(0, 3)) {
			duringLoadShedding.push({
				id: session.id,
				type: 'quiz',
				title: session.topic || 'Practice Quiz',
				subject: 'Practice',
				estimatedDuration: session.durationMinutes || 30,
				sizeEstimate: 0.5,
			});
		}

		// Add past papers for offline study
		for (const paper of papers.slice(0, 2)) {
			duringLoadShedding.push({
				id: paper.id,
				type: 'paper',
				title: `${paper.subject} ${paper.year} ${paper.month}`,
				subject: paper.subject,
				estimatedDuration: 60,
				sizeEstimate: 2,
			});
		}

		const totalSize = [...beforeLoadShedding, ...duringLoadShedding].reduce(
			(sum, item) => sum + item.sizeEstimate,
			0
		);

		return {
			beforeLoadShedding,
			duringLoadShedding,
			totalSizeMB: totalSize,
			estimatedOfflineHours: offlineHours,
		};
	} catch (error) {
		console.error('generatePreDownloadPlan failed:', error);
		return {
			beforeLoadShedding: [],
			duringLoadShedding: [],
			totalSizeMB: 0,
			estimatedOfflineHours: 0,
		};
	}
}

/**
 * Generate offline-optimized study recommendations based on load shedding stage
 */
export async function getLoadSheddingStudyRecommendations(stage: number): Promise<{
	recommendedActivities: Array<{
		activity: string;
		requiresInternet: boolean;
		description: string;
		priority: number;
	}>;
	tips: string[];
}> {
	const activities = [
		{
			activity: 'Flashcard Review',
			requiresInternet: false,
			description: 'Review due flashcards for spaced repetition',
			priority: stage >= 4 ? 1 : 3,
		},
		{
			activity: 'Past Paper Practice',
			requiresInternet: false,
			description: 'Work through downloaded past paper questions',
			priority: stage >= 4 ? 2 : 4,
		},
		{
			activity: 'Notes Review',
			requiresInternet: false,
			description: 'Go through previously saved notes and summaries',
			priority: stage >= 3 ? 3 : 5,
		},
		{
			activity: 'AI Tutor Session',
			requiresInternet: true,
			description: 'Get help from the AI tutor on difficult concepts',
			priority: stage <= 2 ? 1 : 99,
		},
		{
			activity: 'Live Study Rooms',
			requiresInternet: true,
			description: 'Join study rooms with other students',
			priority: stage <= 2 ? 2 : 99,
		},
		{
			activity: 'Video Lessons',
			requiresInternet: true,
			description: 'Watch instructional videos',
			priority: stage <= 3 ? 3 : 99,
		},
	];

	const tips: string[] = [];

	if (stage >= 3) {
		tips.push('Download your flashcards and past papers now while you still have power');
		tips.push('Focus on offline activities like practice questions and note review');
		tips.push('Queue AI questions for when power returns');
	}

	if (stage >= 4) {
		tips.push('Prioritize active recall with flashcards');
		tips.push('Work through past paper problems step-by-step');
	}

	if (stage >= 5) {
		tips.push('Extended outage expected - focus on foundational review');
		tips.push('Use pen and paper for working through problems');
	}

	if (stage <= 2) {
		tips.push('Great time for AI tutor sessions and interactive learning');
		tips.push('Join study rooms for collaborative learning');
	}

	// Filter and sort activities by priority
	const recommendedActivities = activities
		.filter((a) => !a.requiresInternet || stage <= 2)
		.sort((a, b) => a.priority - b.priority);

	return { recommendedActivities, tips };
}
