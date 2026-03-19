'use client';

import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SuggestionCard } from './constants';

interface SuggestionCardsProps {
	cards: SuggestionCard[];
	selectedCard: string | null;
	onCardClick: (cardId: string) => void;
}

export function SuggestionCards({ cards, selectedCard, onCardClick }: SuggestionCardsProps) {
	return (
		<section>
			<h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
				Quick actions
			</h2>
			<div className="grid grid-cols-2 gap-3">
				{cards.map((card, index) => (
					<m.button
						key={card.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.08 }}
						onClick={() => onCardClick(card.id)}
						className={cn(
							'flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all tiimo-press text-left',
							selectedCard === card.id
								? 'bg-primary-soft border-primary'
								: 'bg-card border-border hover:border-primary/50'
						)}
					>
						<span className="text-3xl">{card.emoji}</span>
						<div>
							<h3 className="font-semibold text-foreground">{card.title}</h3>
							<p className="text-xs text-muted-foreground mt-1">{card.description}</p>
						</div>
					</m.button>
				))}
			</div>
		</section>
	);
}
