'use client';

import { Chemistry01Icon, LayoutLeftIcon, TranslateIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { memo } from 'react';

interface Category {
	id: string;
	name: string;
	icon: IconSvgElement;
}

const categories: Category[] = [
	{ id: 'all', name: 'All Subjects', icon: LayoutLeftIcon },
	{ id: 'mathematics', name: 'Mathematics', icon: LayoutLeftIcon },
	{ id: 'physical_sciences', name: 'Physical Sciences', icon: Chemistry01Icon },
	{ id: 'life_sciences', name: 'Life Sciences', icon: LayoutLeftIcon },
	{ id: 'languages', name: 'Languages', icon: TranslateIcon },
];

interface CategorySelectorProps {
	activeCategory: string;
	onCategoryChange: (category: string) => void;
}

export const CategorySelector = memo(function CategorySelector({
	activeCategory,
	onCategoryChange,
}: CategorySelectorProps) {
	return (
		<nav
			className="flex gap-2 sm:gap-3 mt-6 sm:mt-8 overflow-x-auto no-scrollbar"
			aria-label="Lesson categories"
		>
			{categories.map((cat) => (
				<button
					key={cat.id}
					type="button"
					onClick={() => onCategoryChange(cat.id)}
					aria-pressed={activeCategory === cat.id ? 'true' : 'false'}
					className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${
						activeCategory === cat.id
							? 'bg-foreground text-background border-foreground shadow-lg'
							: 'bg-card text-muted-foreground border-border hover:text-foreground'
					}`}
				>
					<HugeiconsIcon
						icon={cat.icon}
						className={`w-4 h-4 ${activeCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`}
					/>
					{cat.name}
				</button>
			))}
		</nav>
	);
});
