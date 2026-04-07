'use client';

import { Chemistry01Icon, LayoutLeftIcon, TranslateIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LessonCard } from '@/components/Lessons/LessonCard';
import { Button } from '@/components/ui/button';

interface LessonsBrowserProps {
	activeCategory: string;
	setActiveCategory: (id: string) => void;
	filteredLessons: any[];
	loading: boolean;
}

export default function LessonsBrowser({
	activeCategory,
	setActiveCategory,
	filteredLessons,
	loading,
}: LessonsBrowserProps) {
	if (loading) {
		return (
			<div className="flex flex-col h-full items-center justify-center bg-background py-12">
				<div className="animate-pulse flex flex-col items-center">
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<HugeiconsIcon icon={LayoutLeftIcon} className="w-6 h-6 text-primary" />
					</div>
					<p className="text-muted-foreground text-sm">loading lessons...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Category selector */}
			<nav
				className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar"
				aria-label="Lesson categories"
			>
				{[
					{ id: 'all', name: 'all subjects', icon: LayoutLeftIcon },
					{ id: 'mathematics', name: 'mathematics', icon: LayoutLeftIcon },
					{ id: 'physical_sciences', name: 'physical sciences', icon: Chemistry01Icon },
					{ id: 'life_sciences', name: 'life sciences', icon: LayoutLeftIcon },
					{ id: 'languages', name: 'languages', icon: TranslateIcon },
				].map((cat) => (
					<Button
						key={cat.id}
						type="button"
						variant="ghost"
						onClick={() => setActiveCategory(cat.id)}
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
					</Button>
				))}
			</nav>

			<div className="relative">
				{/* Vertical Line for the "path" feel */}
				<div className="absolute left-9.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-border/50 z-0" />
				<div className="space-y-6 relative z-10">
					{filteredLessons.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">No lessons found for this category</p>
						</div>
					) : (
						filteredLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
					)}
				</div>
			</div>
		</div>
	);
}
