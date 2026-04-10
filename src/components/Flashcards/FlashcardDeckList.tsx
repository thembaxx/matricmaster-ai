'use client';

import { Layers01Icon, PlusIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FlashcardDeckListProps {
	searchQuery?: string;
}

const mockDecks = [
	{
		id: '1',
		name: 'Periodic Table Elements',
		subject: 'Chemistry',
		cards: 118,
		category: 'elements',
	},
	{ id: '2', name: 'Algebra Formulas', subject: 'Mathematics', cards: 45, category: 'formulas' },
	{ id: '3', name: 'Physics Equations', subject: 'Physics', cards: 32, category: 'equations' },
	{
		id: '4',
		name: 'Biology Key Terms',
		subject: 'Life Sciences',
		cards: 78,
		category: 'vocabulary',
	},
];

export default function FlashcardDeckList({ searchQuery = '' }: FlashcardDeckListProps) {
	const [localSearch, setLocalSearch] = useState(searchQuery);

	const filteredDecks = mockDecks.filter(
		(deck) =>
			deck.name.toLowerCase().includes(localSearch.toLowerCase()) ||
			deck.subject.toLowerCase().includes(localSearch.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="relative">
				<HugeiconsIcon
					icon={Search01Icon}
					className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
				/>
				<Input
					placeholder="search flashcards..."
					className="pl-11 h-12 rounded-2xl bg-muted/30 border-none"
					value={localSearch}
					onChange={(e) => setLocalSearch(e.target.value)}
				/>
			</div>

			<div className="flex justify-end">
				<Button className="rounded-2xl gap-2">
					<HugeiconsIcon icon={PlusIcon} className="w-4 h-4" />
					create deck
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{filteredDecks.map((deck) => (
					<div
						key={deck.id}
						className="p-6 rounded-3xl border border-border hover:border-primary/20 hover:shadow-soft-lg transition-all duration-500 group cursor-pointer bg-card/50 backdrop-blur-sm"
					>
						<div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
							<HugeiconsIcon icon={Layers01Icon} className="w-6 h-6 text-brand-orange" />
						</div>
						<h3 className="text-lg font-black text-foreground tracking-tight mb-2">{deck.name}</h3>
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline" className="rounded-lg font-bold text-xs">
								{deck.subject}
							</Badge>
							<span className="text-sm font-medium text-muted-foreground">{deck.cards} cards</span>
						</div>
					</div>
				))}
			</div>

			{filteredDecks.length === 0 && (
				<div className="text-center py-12">
					<p className="text-muted-foreground font-medium">
						No flashcards found matching "{localSearch}"
					</p>
				</div>
			)}
		</div>
	);
}
