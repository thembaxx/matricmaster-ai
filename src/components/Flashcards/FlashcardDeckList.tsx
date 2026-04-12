'use client';

import { Layers01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FlashcardDeckListProps {
	searchQuery?: string;
}

export default function FlashcardDeckList({
	searchQuery: _searchQuery = '',
}: FlashcardDeckListProps) {
	return (
		<div className="text-center py-12 space-y-4">
			<HugeiconsIcon icon={Layers01Icon} className="w-16 h-16 mx-auto text-muted-foreground/50" />
			<p className="text-muted-foreground font-medium">No flashcard decks yet.</p>
			<p className="text-sm text-muted-foreground/70">
				Create your first deck or save questions from Snap & Solve.
			</p>
			<div className="flex justify-center gap-3">
				<Button asChild>
					<Link href="/flashcards/new">Create Deck</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link href="/snap-and-solve">Snap & Solve</Link>
				</Button>
			</div>
		</div>
	);
}
