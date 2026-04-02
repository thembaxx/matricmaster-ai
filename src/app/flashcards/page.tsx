'use client';

import { Add01Icon, BookOpen01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useState, ViewTransition } from 'react';
import { toast } from 'sonner';
import type { Flashcard, FlashcardDeck } from '@/components/Flashcards/constants';
import { DeckGrid } from '@/components/Flashcards/DeckGrid';
import { DeckStatsCards } from '@/components/Flashcards/DeckStatsCards';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authClient } from '@/lib/auth-client';

const FlashcardModal = dynamic(
	() => import('@/components/AI/FlashcardModal').then((mod) => ({ default: mod.FlashcardModal })),
	{ ssr: false, loading: () => null }
);
const CreateDeckModal = dynamic(
	() =>
		import('@/components/Flashcards/CreateDeckModal').then((mod) => ({
			default: mod.CreateDeckModal,
		})),
	{ ssr: false, loading: () => null }
);
const DeckDetailModal = dynamic(
	() =>
		import('@/components/Flashcards/DeckDetailModal').then((mod) => ({
			default: mod.DeckDetailModal,
		})),
	{ ssr: false, loading: () => null }
);

export default function FlashcardsPage() {
	const { data: session } = authClient.useSession();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
	const [deckFlashcards, setDeckFlashcards] = useState<Flashcard[]>([]);
	const [showDeckModal, setShowDeckModal] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);

	const { data: decksData, isLoading } = useQuery<FlashcardDeck[]>({
		queryKey: ['flashcard-decks'],
		queryFn: async () => {
			const response = await fetch('/api/flashcards/decks');
			if (response.ok) {
				const data = await response.json();
				return (data.decks || []) as FlashcardDeck[];
			}
			return [];
		},
		enabled: !!session?.user,
	});

	const decks: FlashcardDeck[] = decksData ?? [];

	const handleOpenDeck = async (deck: FlashcardDeck) => {
		try {
			const response = await fetch(`/api/flashcards/decks/${deck.id}`);
			if (response.ok) {
				const data = await response.json();
				setDeckFlashcards(data.flashcards || []);
				setSelectedDeck(deck);
				setShowDeckModal(true);
			}
		} catch (error) {
			console.debug('Failed to load deck:', error);
			toast.error('Failed to load deck');
		}
	};

	const handleStartReview = async (deck: FlashcardDeck) => {
		try {
			const response = await fetch(`/api/flashcards/decks/${deck.id}`);
			if (response.ok) {
				const data = await response.json();
				const cards = data.flashcards || [];
				if (cards.length === 0) {
					toast.error('This deck has no cards to review');
					return;
				}
				setReviewCards(cards);
				setShowReviewModal(true);
			}
		} catch (error) {
			console.debug('Failed to start review:', error);
			toast.error('Failed to start review');
		}
	};

	const handleDeleteDeck = async (deck: FlashcardDeck) => {
		if (!confirm(`Are you sure you want to delete "${deck.name}"? This cannot be undone.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/flashcards/decks/${deck.id}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Deck deleted');
			} else {
				toast.error('Failed to delete deck');
			}
		} catch (error) {
			console.debug('Failed to delete deck:', error);
			toast.error('Failed to delete deck');
		}
	};

	const handleDeckCreated = () => {
		setShowCreateModal(false);
	};

	const handleCardsUpdated = () => {
		// Refetch will happen automatically with useQuery
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<HugeiconsIcon
					icon={Loading03Icon}
					className="h-8 w-8 animate-spin text-muted-foreground"
				/>
			</div>
		);
	}

	return (
		<ViewTransition default="none">
			<div className="vt-nav-forward container mx-auto max-w-6xl px-4 pt-8 pb-32">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
						<p className="text-muted-foreground">
							Create and study flashcard decks with spaced repetition
						</p>
					</div>
					<Button onClick={() => setShowCreateModal(true)}>
						<HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
						New Deck
					</Button>
				</div>

				<DeckStatsCards decks={decks} />

				{decks.length === 0 ? (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-16">
							<HugeiconsIcon
								icon={BookOpen01Icon}
								className="h-16 w-16 text-muted-foreground/50 mb-4"
							/>
							<h3 className="text-xl font-semibold mb-2">No flashcard decks yet</h3>
							<p className="text-muted-foreground text-center mb-4 max-w-md">
								Create your first deck to start studying with spaced repetition. You can also
								generate flashcards from the Study Helper.
							</p>
							<Button onClick={() => setShowCreateModal(true)}>
								<HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
								Create Your First Deck
							</Button>
						</CardContent>
					</Card>
				) : (
					<ScrollArea className="h-[calc(100vh-400px)]">
						<DeckGrid
							decks={decks}
							onOpenDeck={handleOpenDeck}
							onStartReview={handleStartReview}
							onDeleteDeck={handleDeleteDeck}
						/>
					</ScrollArea>
				)}

				<CreateDeckModal
					open={showCreateModal}
					onOpenChange={setShowCreateModal}
					onCreated={handleDeckCreated}
				/>

				{selectedDeck && (
					<DeckDetailModal
						open={showDeckModal}
						onOpenChange={setShowDeckModal}
						deck={selectedDeck}
						flashcards={deckFlashcards}
						onUpdated={handleCardsUpdated}
					/>
				)}

				{showReviewModal && reviewCards.length > 0 && (
					<FlashcardModal
						open={showReviewModal}
						onOpenChange={setShowReviewModal}
						flashcards={reviewCards.map((c) => ({
							id: c.id,
							front: c.front,
							back: c.back,
							tags: [],
						}))}
						reviewMode={true}
					/>
				)}
			</div>
		</ViewTransition>
	);
}
