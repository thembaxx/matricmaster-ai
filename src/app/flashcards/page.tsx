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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
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
	const [deleteDeck, setDeleteDeck] = useState<FlashcardDeck | null>(null);

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

	const handleDeleteDeck = async () => {
		if (!deleteDeck) return;

		try {
			const response = await fetch(`/api/flashcards/decks/${deleteDeck.id}`, {
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
		} finally {
			setDeleteDeck(null);
		}
	};

	const handleDeckCreated = () => {
		setShowCreateModal(false);
	};

	const handleCardsUpdated = () => {};

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
			<main className="overflow-x-hidden w-full max-w-full">
				<section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
					<div
						className="absolute inset-0 opacity-[0.03]"
						style={{
							backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
						}}
					/>
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
					<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />

					<div className="container relative z-10 mx-auto max-w-6xl px-6 py-20">
						<div className="text-center">
							<h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-foreground">
								Master your flashcards
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
								Build powerful memory with spaced repetition. Create decks, add cards, and track
								your progress with AI-powered insights.
							</p>
							<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
								<Button
									size="lg"
									onClick={() => setShowCreateModal(true)}
									className="min-w-[200px] text-base"
								>
									<HugeiconsIcon icon={Add01Icon} className="mr-2 h-5 w-5" />
									Create New Deck
								</Button>
								<Button
									size="lg"
									variant="outline"
									onClick={() =>
										document.getElementById('decks')?.scrollIntoView({ behavior: 'smooth' })
									}
									className="min-w-[200px] text-base"
								>
									<HugeiconsIcon icon={BookOpen01Icon} className="mr-2 h-5 w-5" />
									Browse Decks
								</Button>
							</div>
						</div>
					</div>
				</section>

				<section id="decks" className="container mx-auto max-w-6xl px-6 py-16">
					<div className="mb-8 flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold tracking-tight">Your flashcard decks</h2>
							<p className="text-muted-foreground mt-1">
								{decks.length === 0
									? 'Start building your memory collection'
									: `${decks.length} deck${decks.length === 1 ? '' : 's'} ready for study`}
							</p>
						</div>
						<Button onClick={() => setShowCreateModal(true)}>
							<HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
							New Deck
						</Button>
					</div>

					<DeckStatsCards decks={decks} />

					{decks.length === 0 ? (
						<Card className="border-dashed border-2 border-border/50">
							<CardContent className="flex flex-col items-center justify-center py-16">
								<HugeiconsIcon
									icon={BookOpen01Icon}
									className="h-16 w-16 text-muted-foreground/30 mb-6"
								/>
								<h3 className="text-2xl font-semibold mb-3">No flashcard decks yet</h3>
								<p className="text-muted-foreground text-center mb-6 max-w-md">
									Create your first deck to start studying with spaced repetition. You can also
									generate flashcards from the Study Helper.
								</p>
								<Button size="lg" onClick={() => setShowCreateModal(true)}>
									<HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
									Create Your First Deck
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="h-[calc(100vh-400px)]">
							<DeckGrid
								decks={decks}
								onOpenDeck={handleOpenDeck}
								onStartReview={handleStartReview}
								onDeleteDeck={(deck) => setDeleteDeck(deck)}
							/>
						</div>
					)}
				</section>

				<section className="relative py-20 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
					<div className="container relative mx-auto max-w-4xl px-6 text-center">
						<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
							Ready to accelerate your learning?
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
							Combine flashcards with past papers, quizzes, and AI tutoring for a complete study
							experience.
						</p>
						<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
							<Button size="lg" className="min-w-[180px]">
								Explore Features
							</Button>
							<Button size="lg" variant="outline" className="min-w-[180px]">
								Learn More
							</Button>
						</div>
					</div>
				</section>

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
							difficulty: c.difficulty,
						}))}
						reviewMode={true}
						adaptiveDifficulty={true}
						onRate={async (flashcardId, rating) => {
							try {
								const response = await fetch('/api/flashcards/review', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ flashcardId, rating }),
								});
								if (!response.ok) {
									throw new Error('Failed to save rating');
								}
							} catch (error) {
								console.error('Failed to rate flashcard:', error);
								throw error;
							}
						}}
					/>
				)}

				<ConfirmDialog
					open={!!deleteDeck}
					onOpenChange={(open) => !open && setDeleteDeck(null)}
					onConfirm={handleDeleteDeck}
					title={`Delete "${deleteDeck?.name}"?`}
					description="This will permanently delete this deck and all its flashcards. This action cannot be undone."
					confirmLabel="Delete deck"
					cancelLabel="Keep deck"
					variant="destructive"
				/>
			</main>
		</ViewTransition>
	);
}
