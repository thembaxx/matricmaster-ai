'use client';

import {
	Add01Icon,
	Delete02Icon,
	Edit01Icon,
	Loading03Icon,
	Quiz01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { generateQuestionsAction } from '@/services/aiActions';

interface Flashcard {
	id: string;
	front: string;
	back: string;
	timesReviewed: number;
	timesCorrect: number;
	nextReview: Date | null;
}

interface Deck {
	id: string;
	name: string;
	description: string | null;
	cardCount: number;
}

interface DeckDetailModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deck: Deck;
	flashcards: Flashcard[];
	onUpdated: () => void;
}

export function DeckDetailModal({
	open,
	onOpenChange,
	deck,
	flashcards,
	onUpdated,
}: DeckDetailModalProps) {
	const modalId = useId();
	const [showAddCard, setShowAddCard] = useState(false);
	const [front, setFront] = useState('');
	const [back, setBack] = useState('');
	const [isAdding, setIsAdding] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editFront, setEditFront] = useState('');
	const [editBack, setEditBack] = useState('');
	const [isEditing, setIsEditing] = useState(false);

	const handleAddCard = async () => {
		if (!front.trim() || !back.trim()) {
			toast.error('Please fill in both front and back');
			return;
		}

		setIsAdding(true);
		try {
			const response = await fetch(`/api/flashcards/decks/${deck.id}/cards`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ front: front.trim(), back: back.trim() }),
			});

			if (response.ok) {
				toast.success('Card added!');
				setFront('');
				setBack('');
				onUpdated();
			} else {
				toast.error('Failed to add card');
			}
		} catch (error) {
			console.debug('Failed to add card:', error);
			toast.error('Failed to add card');
		} finally {
			setIsAdding(false);
		}
	};

	const handleDeleteCard = async (cardId: string) => {
		if (!confirm('Backspace this card?')) return;

		setDeletingId(cardId);
		try {
			const response = await fetch(`/api/flashcards/decks/${deck.id}/cards/${cardId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Card deleted');
				onUpdated();
			} else {
				toast.error('Failed to delete card');
			}
		} catch (error) {
			console.debug('Failed to delete card:', error);
			toast.error('Failed to delete card');
		} finally {
			setDeletingId(null);
		}
	};

	const handleStartEdit = (card: { id: string; front: string; back: string }) => {
		setEditingId(card.id);
		setEditFront(card.front);
		setEditBack(card.back);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditFront('');
		setEditBack('');
	};

	const handleSaveEdit = async (cardId: string) => {
		if (!editFront.trim() || !editBack.trim()) {
			toast.error('Please fill in both front and back');
			return;
		}

		setIsEditing(true);
		try {
			const response = await fetch(`/api/flashcards/decks/${deck.id}/cards/${cardId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ front: editFront.trim(), back: editBack.trim() }),
			});

			if (response.ok) {
				toast.success('Card updated!');
				setEditingId(null);
				onUpdated();
			} else {
				toast.error('Failed to update card');
			}
		} catch (error) {
			console.debug('Failed to update card:', error);
			toast.error('Failed to update card');
		} finally {
			setIsEditing(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh]">
				<DialogHeader>
					<DialogTitle>{deck.name}</DialogTitle>
					<DialogDescription>
						{deck.description || `${flashcards.length} flashcards`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex gap-2">
						<Button
							onClick={() => setShowAddCard(!showAddCard)}
							variant="outline"
							className="flex-1"
						>
							<HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
							Add Card
						</Button>
						<CreateQuizFromDeckButton deck={deck} flashcards={flashcards} />
					</div>

					{showAddCard && (
						<div className="space-y-3 rounded-lg border p-4">
							<div className="space-y-2">
								<Label htmlFor={`front-${modalId}`}>Front</Label>
								<Textarea
									id={`front-${modalId}`}
									placeholder="Question or term..."
									value={front}
									onChange={(e) => setFront(e.target.value)}
									rows={2}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={`back-${modalId}`}>Back</Label>
								<Textarea
									id={`back-${modalId}`}
									placeholder="Answer or definition..."
									value={back}
									onChange={(e) => setBack(e.target.value)}
									rows={2}
								/>
							</div>
							<Button onClick={handleAddCard} disabled={isAdding} className="w-full">
								{isAdding ? (
									<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
								)}
								Add Card
							</Button>
						</div>
					)}

					<ScrollArea className="min-h-[300px] max-h-[500px] pr-4">
						{flashcards.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								No cards in this deck yet. Add some to get started!
							</div>
						) : (
							<div className="space-y-3">
								{flashcards.map((card) =>
									editingId === card.id ? (
										<div key={card.id} className="rounded-lg border p-3 space-y-2 bg-muted/30">
											<Textarea
												value={editFront}
												onChange={(e) => setEditFront(e.target.value)}
												placeholder="Question or term..."
												rows={2}
											/>
											<Textarea
												value={editBack}
												onChange={(e) => setEditBack(e.target.value)}
												placeholder="Answer or definition..."
												rows={2}
											/>
											<div className="flex gap-2">
												<Button
													size="sm"
													onClick={() => handleSaveEdit(card.id)}
													disabled={isEditing}
												>
													{isEditing ? 'Saving...' : 'Save'}
												</Button>
												<Button size="sm" variant="outline" onClick={handleCancelEdit}>
													Cancel
												</Button>
											</div>
										</div>
									) : (
										<div
											key={card.id}
											className="flex items-start gap-3 rounded-lg border p-3 group"
										>
											<div className="flex-1 space-y-1">
												<p className="font-medium text-sm">{card.front}</p>
												<p className="text-xs text-muted-foreground">{card.back}</p>
											</div>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													className="h-9 w-9 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100 opacity-100 touch-manipulation"
													onClick={() => handleStartEdit(card)}
												>
													<HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-9 w-9 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100 opacity-100 text-destructive touch-manipulation"
													onClick={() => handleDeleteCard(card.id)}
													disabled={deletingId === card.id}
												>
													{deletingId === card.id ? (
														<HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
													) : (
														<HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
									)
								)}
							</div>
						)}
					</ScrollArea>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface FlashcardForQuiz {
	id: string;
	front: string;
	back: string;
	timesReviewed: number;
	timesCorrect: number;
}

interface CreateQuizFromDeckButtonProps {
	deck: { id: string; name: string };
	flashcards: FlashcardForQuiz[];
}

function CreateQuizFromDeckButton({ deck, flashcards }: CreateQuizFromDeckButtonProps) {
	const [isGenerating, setIsGenerating] = useState(false);

	const handleCreateQuiz = async (mode: 'all' | 'correct' | 'weak') => {
		setIsGenerating(true);
		try {
			let topics: string[] = [];

			if (mode === 'all') {
				topics = flashcards.slice(0, 5).map((f) => f.front);
			} else if (mode === 'correct') {
				const correctCards = flashcards.filter(
					(f) => f.timesCorrect > 0 && f.timesCorrect >= f.timesReviewed / 2
				);
				topics = correctCards.slice(0, 5).map((f) => f.front);
			} else {
				const weakCards = flashcards.filter(
					(f) => f.timesReviewed >= 2 && f.timesCorrect < f.timesReviewed / 2
				);
				topics = weakCards.slice(0, 5).map((f) => f.front);
			}

			if (topics.length === 0) {
				topics = flashcards.slice(0, 5).map((f) => f.front);
			}

			const result = await generateQuestionsAction(
				deck.name,
				topics.join(', '),
				'medium',
				'multiple_choice',
				5
			);

			if (result.success && result.questions) {
				toast.success(`Generated ${result.questions.length} quiz questions!`);
				window.location.href = `/quiz?topic=${encodeURIComponent(deck.name)}`;
			} else {
				toast.error(result.error || 'Failed to generate quiz');
			}
		} catch (error) {
			console.error('Failed to create quiz:', error);
			toast.error('Failed to create quiz');
		} finally {
			setIsGenerating(false);
		}
	};

	const weakCount = flashcards.filter(
		(f) => f.timesReviewed >= 2 && f.timesCorrect < f.timesReviewed / 2
	).length;
	const correctCount = flashcards.filter(
		(f) => f.timesCorrect > 0 && f.timesCorrect >= f.timesReviewed / 2
	).length;

	return (
		<div className="relative">
			<Button
				onClick={() => handleCreateQuiz('all')}
				disabled={isGenerating || flashcards.length === 0}
				variant="outline"
				className="flex-1"
			>
				<HugeiconsIcon icon={Quiz01Icon} className="mr-2 h-4 w-4" />
				{isGenerating ? 'Generating...' : 'Create Quiz'}
			</Button>
			{flashcards.length > 0 && (
				<div className="mt-2 flex gap-2 text-xs text-muted-foreground">
					{weakCount > 0 && (
						<button
							type="button"
							onClick={() => handleCreateQuiz('weak')}
							className="flex items-center gap-1 hover:text-destructive"
						>
							<span className="font-medium text-destructive">{weakCount}</span> weak
						</button>
					)}
					{correctCount > 0 && (
						<button
							type="button"
							onClick={() => handleCreateQuiz('correct')}
							className="flex items-center gap-1 hover:text-primary"
						>
							<span className="font-medium text-primary">{correctCount}</span> strong
						</button>
					)}
				</div>
			)}
		</div>
	);
}
