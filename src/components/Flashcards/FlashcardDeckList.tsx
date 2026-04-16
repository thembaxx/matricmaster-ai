'use client';

import { Add01Icon, Layers01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFlashcardDecks } from '@/hooks/useFlashcardDecks';

interface FlashcardDeckListProps {
	searchQuery?: string;
}

export default function FlashcardDeckList({ searchQuery = '' }: FlashcardDeckListProps) {
	const router = useRouter();
	const [localSearch, setLocalSearch] = useState(searchQuery);
	const { decks, isLoading } = useFlashcardDecks();

	const filteredDecks = decks.filter((deck: { name: string }) =>
		deck.name.toLowerCase().includes(localSearch.toLowerCase())
	);

	const handleDeckClick = () => {
		router.push('/flashcards');
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
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
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-sm"
						>
							<Skeleton className="w-12 h-12 rounded-2xl mb-4" />
							<Skeleton className="h-6 w-3/4 mb-2" />
							<div className="flex gap-2">
								<Skeleton className="h-5 w-16" />
								<Skeleton className="h-5 w-20" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
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
				<Button className="rounded-2xl gap-2" onClick={() => router.push('/flashcards')}>
					<HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
					create deck
				</Button>
			</div>

			{filteredDecks.length === 0 && localSearch ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
						<HugeiconsIcon icon={Search01Icon} className="w-8 h-8 text-muted-foreground" />
					</div>
					<p className="text-muted-foreground font-medium mb-2">
						No flashcards found matching "{localSearch}"
					</p>
					<p className="text-muted-foreground/60 text-sm">
						try adjusting your search or create a new deck
					</p>
				</div>
			) : filteredDecks.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
						<HugeiconsIcon icon={Layers01Icon} className="w-8 h-8 text-brand-orange" />
					</div>
					<p className="text-muted-foreground font-medium mb-2">no flashcard decks yet</p>
					<p className="text-muted-foreground/60 text-sm mb-4">
						create your first deck to start studying with spaced repetition
					</p>
					<Button onClick={() => router.push('/flashcards')} className="rounded-2xl gap-2">
						<HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
						create your first deck
					</Button>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredDecks.map((deck) => (
						<div
							key={deck.id}
							role="button"
							tabIndex={0}
							onClick={handleDeckClick}
							onKeyDown={(e) => e.key === 'Enter' && handleDeckClick()}
							className="p-6 rounded-3xl border border-border hover:border-primary/20 hover:shadow-soft-lg transition-all duration-500 group cursor-pointer bg-card/50 backdrop-blur-sm"
						>
							<div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<HugeiconsIcon icon={Layers01Icon} className="w-6 h-6 text-brand-orange" />
							</div>
							<h3 className="text-lg font-black text-foreground tracking-tight mb-2">
								{deck.name}
							</h3>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline" className="rounded-lg font-bold text-xs">
									{deck.subjectId ? `Subject #${deck.subjectId}` : 'General'}
								</Badge>
								<span className="text-sm font-medium text-muted-foreground">
									{deck.cardCount} cards
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
