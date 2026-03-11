'use client';

import { FireIcon as Fire } from 'hugeicons-react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { STAGGER_ITEM } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

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
		<m.div variants={STAGGER_ITEM} className="space-y-8">
			<div className="flex items-center gap-4 px-2">
				<Fire size={20} className="text-tiimo-orange fill-tiimo-orange/20 stroke-[3px]" />
				<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
					Viral topics
				</h2>
			</div>
			<div className="flex flex-wrap gap-4">
				{TRENDING_TOPICS.map((topic) => (
					<m.button
						key={topic}
						whileHover={{ scale: 1.05, y: -4 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => onTopicClick(topic)}
						className="px-8 py-5 rounded-[2rem] bg-card text-md font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-primary/20 border-none"
					>
						{topic}
					</m.button>
				))}
			</div>
		</m.div>
	);
});
