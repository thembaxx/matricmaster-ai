'use client';

import { BookOpen01Icon, Delete02Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import type { FlashcardDeck } from './constants';

interface DeckStats {
	totalCards: number;
	newCards: number;
	learningCards: number;
	reviewCards: number;
	averageEase: number;
	dueToday: number;
}

interface DeckCardProps {
	deck: FlashcardDeck;
	stats?: DeckStats;
	dueCards?: number;
	onOpenDeck: (deck: FlashcardDeck) => void;
	onStartReview: (deck: FlashcardDeck) => void;
	onDeleteDeck: (deck: FlashcardDeck) => void;
}

export function DeckCard({
	deck,
	stats,
	dueCards = 0,
	onOpenDeck,
	onStartReview,
	onDeleteDeck,
}: DeckCardProps) {
	const masteryProgress =
		stats && stats.totalCards > 0 ? Math.round((stats.reviewCards / stats.totalCards) * 100) : 0;

	return (
		<Card className="group relative overflow-hidden transition-all hover:shadow-md">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<CardTitle className="text-lg line-clamp-1">{deck.name}</CardTitle>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity"
							>
								<HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onOpenDeck(deck)}>
								<HugeiconsIcon icon={BookOpen01Icon} className="mr-2 h-4 w-4" />
								View Cards
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDeleteDeck(deck)}
								className="text-destructive focus:text-destructive"
							>
								<HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<CardDescription className="line-clamp-2">
					{deck.description || 'No description'}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{stats && (
					<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>Mastery</span>
							<span className="font-mono font-medium">{masteryProgress}%</span>
						</div>
						<Progress value={masteryProgress} className="h-1.5" />
					</m.div>
				)}

				<div className="flex flex-wrap gap-2">
					<Badge variant="secondary" className="font-mono text-xs">
						{deck.cardCount} cards
					</Badge>
					{stats && (
						<>
							<Badge
								variant="outline"
								className="font-mono text-xs bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
							>
								{stats.newCards} new
							</Badge>
							<Badge
								variant="outline"
								className="font-mono text-xs bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
							>
								{stats.learningCards} learning
							</Badge>
						</>
					)}
					{dueCards > 0 && (
						<Badge
							variant="outline"
							className="font-mono text-xs bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
						>
							{dueCards} due
						</Badge>
					)}
				</div>

				{stats && stats.totalCards > 0 && (
					<div className="flex items-center justify-between text-[10px] text-muted-foreground">
						<span>Ease: </span>
						<span className="font-mono font-medium">{stats.averageEase.toFixed(2)}</span>
						<span className="ml-4">Next: </span>
						<span className="font-mono font-medium">{stats.dueToday > 0 ? 'Now' : 'None'}</span>
					</div>
				)}

				<Button
					size="sm"
					className="w-full"
					onClick={() => onStartReview(deck)}
					disabled={deck.cardCount === 0}
				>
					{deck.cardCount === 0 ? 'Empty Deck' : dueCards > 0 ? `Study (${dueCards} due)` : 'Study'}
				</Button>
			</CardContent>
		</Card>
	);
}
