'use server';

import { getAuth } from '@/lib/auth';
import { getDueFlashcards } from '@/lib/db/review-queue-actions';

/**
 * Bridge: Flashcards → Smart Scheduler
 * Reads due flashcard dates and creates a suggested study block for the Smart Scheduler.
 */

export interface FlashcardScheduleBlock {
	id: string;
	type: 'flashcard_review';
	title: string;
	description: string;
	dueCount: string;
	estimatedMinutes: number;
	priority: 'high' | 'medium' | 'low';
	suggestedTime: string;
}

export async function getDueFlashcardScheduleBlock(): Promise<FlashcardScheduleBlock | null> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) return null;

	try {
		const dueCards = await getDueFlashcards(session.user.id);

		if (dueCards.length === 0) return null;

		const estimatedMinutes = Math.min(dueCards.length * 2, 60);
		const priority = dueCards.length >= 10 ? 'high' : dueCards.length >= 5 ? 'medium' : 'low';

		return {
			id: 'flashcard-review-due',
			type: 'flashcard_review',
			title: `Review ${dueCards.length} due flashcard${dueCards.length > 1 ? 's' : ''}`,
			description: `You have ${dueCards.length} flashcard${dueCards.length > 1 ? 's' : ''} due for spaced repetition review. Regular review prevents knowledge decay.`,
			dueCount: dueCards.length.toString(),
			estimatedMinutes,
			priority,
			suggestedTime: priority === 'high' ? '09:00 - 10:00' : '19:00 - 19:30',
		};
	} catch (error) {
		console.debug('[Flashcard Scheduler Bridge] Error getting due flashcards:', error);
		return null;
	}
}
