'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import type { StudyHelpCard } from './constants';

interface SubjectCardsProps {
	cards: StudyHelpCard[];
}

export function SubjectCards({ cards }: SubjectCardsProps) {
	return (
		<section>
			<h2 className="text-sm font-semibold text-muted-foreground mb-4  tracking-wider">
				Or choose a subject
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{cards.map((card, index) => (
					<m.div
						key={card.id}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.3 + index * 0.08 }}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Link
							href={`/subjects/${card.subjectId}`}
							transitionTypes={['nav-forward']}
							className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
						>
							<span className="text-3xl">{card.emoji}</span>
							<div>
								<h3 className="font-semibold text-foreground">{card.title}</h3>
								<p className="text-xs text-muted-foreground">{card.subtitle}</p>
							</div>
						</Link>
					</m.div>
				))}
			</div>
		</section>
	);
}
