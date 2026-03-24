'use client';

import { Button } from '@/components/ui/button';

interface ChannelCategoryButtonProps {
	category: string;
	isActive: boolean;
	onClick: () => void;
}

export function ChannelCategoryButton({ category, isActive, onClick }: ChannelCategoryButtonProps) {
	return (
		<Button
			type="button"
			onClick={onClick}
			variant="ghost"
			className={`px-6 py-2.5 rounded-full text-[11px] font-black  tracking-widest whitespace-nowrap transition-all ios-active-scale ${
				isActive
					? 'bg-foreground text-background shadow-md'
					: 'bg-card text-label-secondary border border-border shadow-sm'
			}`}
		>
			{category}
		</Button>
	);
}

interface CategoryScrollerProps {
	categories: string[];
	activeCategory: string;
	onCategoryChange: (category: string) => void;
}

export function CategoryScroller({
	categories,
	activeCategory,
	onCategoryChange,
}: CategoryScrollerProps) {
	return (
		<div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
			{categories.map((cat) => (
				<ChannelCategoryButton
					key={cat}
					category={cat}
					isActive={activeCategory === cat}
					onClick={() => onCategoryChange(cat)}
				/>
			))}
		</div>
	);
}
