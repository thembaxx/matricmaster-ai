'use client';

import { BookOpen, Brain, Clock, Loader2, MoreVertical, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FlashcardModal } from '@/components/AI/FlashcardModal';
import { CreateDeckModal } from '@/components/Flashcards/CreateDeckModal';
import { DeckDetailModal } from '@/components/Flashcards/DeckDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authClient } from '@/lib/auth-client';

interface FlashcardDeck {
	id: string;
	name: string;
	description: string | null;
	subjectId: number | null;
	cardCount: number;
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
}

interface Flashcard {
	id: string;
	front: string;
	back: string;
	timesReviewed: number;
	timesCorrect: number;
	nextReview: Date | null;
}

export default function FlashcardsPage() {
	const { data: session } = authClient.useSession();
	const [isLoading, setIsLoading] = useState(true);
	const [decks, setDecks] = useState<FlashcardDeck[]>([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
	const [deckFlashcards, setDeckFlashcards] = useState<Flashcard[]>([]);
	const [showDeckModal, setShowDeckModal] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: loadDecks is stable
	useEffect(() => {
		if (session?.user) {
			loadDecks();
		}
	}, [session]);

	const loadDecks = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/flashcards/decks');
			if (response.ok) {
				const data = await response.json();
				setDecks(data.decks || []);
			}
		} catch (error) {
			console.error('Failed to load decks:', error);
			toast.error('Failed to load flashcard decks');
		} finally {
			setIsLoading(false);
		}
	};

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
			console.error('Failed to load deck:', error);
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
			console.error('Failed to start review:', error);
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
				setDecks((prev) => prev.filter((d) => d.id !== deck.id));
			} else {
				toast.error('Failed to delete deck');
			}
		} catch (error) {
			console.error('Failed to delete deck:', error);
			toast.error('Failed to delete deck');
		}
	};

	const handleDeckCreated = (deck: FlashcardDeck) => {
		setDecks((prev) => [deck, ...prev]);
		setShowCreateModal(false);
	};

	const handleCardsUpdated = () => {
		if (selectedDeck) {
			loadDecks();
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
					<p className="text-muted-foreground">
						Create and study flashcard decks with spaced repetition
					</p>
				</div>
				<Button onClick={() => setShowCreateModal(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Deck
				</Button>
			</div>

			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="rounded-full bg-primary/10 p-3">
								<BookOpen className="h-6 w-6 text-primary" />
							</div>
							<div>
								<div className="text-2xl font-bold">{decks.length}</div>
								<div className="text-sm text-muted-foreground">Total Decks</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="rounded-full bg-green-500/10 p-3">
								<Brain className="h-6 w-6 text-green-500" />
							</div>
							<div>
								<div className="text-2xl font-bold">
									{decks.reduce((sum, d) => sum + d.cardCount, 0)}
								</div>
								<div className="text-sm text-muted-foreground">Total Cards</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="rounded-full bg-orange-500/10 p-3">
								<Clock className="h-6 w-6 text-orange-500" />
							</div>
							<div>
								<div className="text-2xl font-bold">
									{decks.filter((d) => d.cardCount > 0).length}
								</div>
								<div className="text-sm text-muted-foreground">Due Today</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="flex items-center justify-center">
					<Button variant="outline" asChild className="w-full h-full">
						<Link href="/review">
							<Brain className="mr-2 h-4 w-4" />
							Start Review
						</Link>
					</Button>
				</Card>
			</div>

			{decks.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
						<h3 className="text-xl font-semibold mb-2">No flashcard decks yet</h3>
						<p className="text-muted-foreground text-center mb-4 max-w-md">
							Create your first deck to start studying with spaced repetition. You can also generate
							flashcards from the AI Tutor.
						</p>
						<Button onClick={() => setShowCreateModal(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Create Your First Deck
						</Button>
					</CardContent>
				</Card>
			) : (
				<ScrollArea className="h-[calc(100vh-400px)]">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{decks.map((deck) => (
							<Card
								key={deck.id}
								className="group relative overflow-hidden transition-all hover:shadow-md"
							>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg line-clamp-1">{deck.name}</CardTitle>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-9 w-9 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity touch-manipulation"
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => handleOpenDeck(deck)}>
													<BookOpen className="mr-2 h-4 w-4" />
													View Cards
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleStartReview(deck)}>
													<Brain className="mr-2 h-4 w-4" />
													Study Deck
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleDeleteDeck(deck)}
													className="text-destructive"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<CardDescription className="line-clamp-2">
										{deck.description || 'No description'}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<Badge variant="secondary">{deck.cardCount} cards</Badge>
										<Button
											size="sm"
											onClick={() => handleStartReview(deck)}
											disabled={deck.cardCount === 0}
										>
											Study
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
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
	);
}
