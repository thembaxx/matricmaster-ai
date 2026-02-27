'use client';

import { Icon } from '@iconify/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { STAGGER_ITEM } from '@/lib/animation-presets';

const TRENDING_TOPICS = [
	'Calculus P1',
	'Newtonian Mechanics',
	'Organic Chemistry',
	'Ecology',
	'Financial Maths',
	'Trigonometry',
];

interface TrendingTopicsProps {
	onTopicClick: (topic: string) => void;
}

export const TrendingTopics = memo(function TrendingTopics({ onTopicClick }: TrendingTopicsProps) {
	return (
		<m.div variants={STAGGER_ITEM} className="space-y-6">
			<div className="flex items-center gap-2">
				<Icon icon="fluent-emoji-flat:fire" className="w-5 h-5" />
				<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
					Trending Now
				</h2>
			</div>
			<div className="flex flex-wrap gap-3">
				{TRENDING_TOPICS.map((topic) => (
					<m.div key={topic} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Badge
							variant="secondary"
							className="px-6 py-3 rounded-2xl bg-card text-sm font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer border-2 border-border shadow-sm"
							onClick={() => onTopicClick(topic)}
						>
							{topic}
						</Badge>
					</m.div>
				))}
			</div>
		</m.div>
	);
});
