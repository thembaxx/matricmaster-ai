'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { getUserDecks } from '@/lib/db/review-queue-actions';

export type FlashcardDeckData = {
	id: string;
	name: string;
	description: string | null;
	subjectId: number | null;
	cardCount: number;
	createdAt: Date;
	updatedAt: Date;
};

export function useFlashcardDecks() {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data: decksData, isLoading } = useQuery({
		queryKey: ['flashcard-decks', userId],
		queryFn: async () => {
			if (!userId) return [];
			const decks = await getUserDecks(userId);
			return decks as FlashcardDeckData[];
		},
		enabled: !!userId,
	});

	const decks = decksData ?? [];

	return {
		decks,
		isLoading,
	};
}
