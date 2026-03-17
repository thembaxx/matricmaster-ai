'use client';

import { Add01Icon, Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons';
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
					<Button onClick={() => setShowAddCard(!showAddCard)} variant="outline" className="w-full">
						<HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
						Add Card
					</Button>

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

					<ScrollArea className="h-[400px] pr-4">
						{flashcards.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								No cards in this deck yet. Add some to get started!
							</div>
						) : (
							<div className="space-y-3">
								{flashcards.map((card) => (
									<div key={card.id} className="flex items-start gap-3 rounded-lg border p-3 group">
										<div className="flex-1 space-y-1">
											<p className="font-medium text-sm">{card.front}</p>
											<p className="text-xs text-muted-foreground">{card.back}</p>
										</div>
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
								))}
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
