import {
	AiBrain01Icon,
	BookOpen01Icon,
	Delete02Icon,
	MoreVerticalIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FlashcardDeck } from './constants';

export function DeckGrid({
	decks,
	onOpenDeck,
	onStartReview,
	onDeleteDeck,
}: {
	decks: FlashcardDeck[];
	onOpenDeck: (deck: FlashcardDeck) => void;
	onStartReview: (deck: FlashcardDeck) => void;
	onDeleteDeck: (deck: FlashcardDeck) => void;
}) {
	return (
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
										<HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => onOpenDeck(deck)}>
										<HugeiconsIcon icon={BookOpen01Icon} className="mr-2 h-4 w-4" />
										View Cards
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onStartReview(deck)}>
										<HugeiconsIcon icon={AiBrain01Icon} className="mr-2 h-4 w-4" />
										Study Deck
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onDeleteDeck(deck)} className="text-destructive">
										<HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
										Backspace
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
							<Button size="sm" onClick={() => onStartReview(deck)} disabled={deck.cardCount === 0}>
								Study
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
