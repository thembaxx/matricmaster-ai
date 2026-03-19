import { AiBrain01Icon, BookOpen01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { FlashcardDeck } from './constants';

export function DeckStatsCards({ decks }: { decks: FlashcardDeck[] }) {
	return (
		<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="rounded-full bg-primary/10 p-3">
							<HugeiconsIcon icon={BookOpen01Icon} className="h-6 w-6 text-primary" />
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
							<HugeiconsIcon icon={AiBrain01Icon} className="h-6 w-6 text-green-500" />
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
							<HugeiconsIcon icon={Clock01Icon} className="h-6 w-6 text-orange-500" />
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
						<HugeiconsIcon icon={AiBrain01Icon} className="mr-2 h-4 w-4" />
						Start Review
					</Link>
				</Button>
			</Card>
		</div>
	);
}
