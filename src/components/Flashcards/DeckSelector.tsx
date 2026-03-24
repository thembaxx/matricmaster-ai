'use client';

import { Add01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useState } from 'react';
import { CreateDeckModal } from '@/components/Flashcards/CreateDeckModal';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface Deck {
	id: string;
	name: string;
	description: string | null;
	subjectId: number | null;
	cardCount: number;
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
}

interface DeckSelectorProps {
	value: string | null;
	onChange: (deckId: string | null) => void;
	onNewDeck?: (deck: Deck) => void;
	className?: string;
	disabled?: boolean;
}

export function DeckSelector({
	value,
	onChange,
	onNewDeck,
	className,
	disabled = false,
}: DeckSelectorProps) {
	const [decks, setDecks] = useState<Deck[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);

	const fetchDecks = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/flashcards/decks');
			if (response.ok) {
				const data = await response.json();
				setDecks(data.decks || []);
			}
		} catch (error) {
			console.debug('Failed to fetch decks:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDecks();
	}, [fetchDecks]);

	const handleCreated = (newDeck: Deck) => {
		setDecks((prev) => [newDeck, ...prev]);
		onChange(newDeck.id);
		onNewDeck?.(newDeck);
		setShowCreateModal(false);
	};

	return (
		<div className={`flex gap-2 ${className || ''}`}>
			<Select
				value={value || '__new__'}
				onValueChange={(val) => {
					if (val === '__new__') {
						setShowCreateModal(true);
					} else {
						onChange(val);
					}
				}}
				disabled={disabled || isLoading}
			>
				<SelectTrigger className="flex-1">
					<SelectValue placeholder={isLoading ? 'Loading decks...' : 'Select a deck'} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="__new__">
						<span className="flex items-center gap-2">
							<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
							Create new deck
						</span>
					</SelectItem>
					{decks.map((deck) => (
						<SelectItem key={deck.id} value={deck.id}>
							<div className="flex items-center gap-2">
								<span>{deck.name}</span>
								<span className="text-[10px] text-muted-foreground">({deck.cardCount} cards)</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Button
				variant="outline"
				size="icon"
				onClick={fetchDecks}
				disabled={disabled || isLoading}
				aria-label="Refresh decks"
				className="shrink-0"
			>
				<HugeiconsIcon
					icon={RefreshIcon}
					className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
				/>
			</Button>

			<CreateDeckModal
				open={showCreateModal}
				onOpenChange={setShowCreateModal}
				onCreated={handleCreated}
			/>
		</div>
	);
}
