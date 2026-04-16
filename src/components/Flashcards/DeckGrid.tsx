import {
	AiBrain01Icon,
	BookOpen01Icon,
	Delete02Icon,
	MoreVerticalIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getSubjectFluentEmoji } from '@/content';
import type { FlashcardDeck } from './constants';

function getSubjectIdFromDeck(deck: FlashcardDeck): string {
	if (deck.subjectId === 1) return 'mathematics';
	if (deck.subjectId === 2) return 'physics';
	if (deck.subjectId === 3) return 'chemistry';
	if (deck.subjectId === 4) return 'life-sciences';
	if (deck.subjectId === 5) return 'english';
	if (deck.subjectId === 6) return 'afrikaans';
	if (deck.subjectId === 7) return 'geography';
	if (deck.subjectId === 8) return 'history';
	if (deck.subjectId === 9) return 'accounting';
	if (deck.subjectId === 10) return 'economics';
	if (deck.subjectId === 11) return 'lo';
	if (deck.subjectId === 12) return 'business-studies';
	return 'mathematics';
}

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
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<FluentEmoji
										type="3d"
										emoji={getSubjectFluentEmoji(getSubjectIdFromDeck(deck))}
										size={20}
										className="w-5 h-5"
									/>
								</div>
								<CardTitle className="text-lg line-clamp-1">{deck.name}</CardTitle>
							</div>
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
