'use client';

import { Icon } from '@iconify/react';
import { motion as m } from 'motion/react';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { STAGGER_ITEM } from '@/lib/animation-presets';

const TOPICS = [
	{ id: 1, name: 'Calculus', count: '2.4k' },
	{ id: 2, name: 'Newtonian Mechanics', count: '1.8k' },
	{ id: 3, name: 'Organic Chemistry', count: '1.2k' },
	{ id: 4, name: 'Trigonometry', count: '950' },
	{ id: 5, name: 'Financial Maths', count: '820' },
];

interface TrendingTopicsProps {
	onTopicClick?: (topic: string) => void;
}

export const TrendingTopics = memo(function TrendingTopics({ onTopicClick }: TrendingTopicsProps) {
	return (
		<m.div variants={STAGGER_ITEM} className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-[10px] font-black text-muted-foreground  tracking-[0.3em] flex items-center gap-2">
					<Icon icon="fluent-emoji-flat:fire" className="w-5 h-5" />
					Trending Topics
				</h2>
			</div>
			<div className="flex flex-wrap gap-2">
				{TOPICS.map((topic) => (
					<Badge
						key={topic.id}
						variant="secondary"
						className="px-4 py-2 rounded-full bg-card hover:bg-primary hover:text-white cursor-pointer transition-all border-none shadow-sm"
						onClick={() => onTopicClick?.(topic.name)}
					>
						<span className="font-bold mr-2">#</span>
						{topic.name}
						<span className="ml-2 text-[10px] opacity-50">{topic.count}</span>
					</Badge>
				))}
			</div>
		</m.div>
	);
});
