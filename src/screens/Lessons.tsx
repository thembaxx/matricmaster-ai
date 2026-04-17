'use client';

import {
	ArrowDown01Icon,
	Chemistry01Icon,
	FireIcon,
	GlobeIcon,
	LayoutLeftIcon,
	TranslateIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewTransition } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { LessonCard } from '@/components/Lessons/LessonCard';
import { Button } from '@/components/ui/button';
import { PremiumUpsell } from '@/components/ui/PremiumUpsell';
import { useLessons } from '@/hooks/useLessons';

export default function Lessons() {
	const { activeCategory, setActiveCategory, filteredLessons, loading } = useLessons();

	if (loading) {
		return (
			<div className="flex flex-col h-full items-center justify-center bg-background">
				<div className="animate-pulse">
					<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<HugeiconsIcon icon={LayoutLeftIcon} className="w-10 h-10 text-primary" />
					</div>
					<p className="text-muted-foreground">loading lessons...</p>
				</div>
			</div>
		);
	}

	return (
		<ViewTransition default="none">
			<div className="vt-nav-forward flex flex-col h-full min-w-0 bg-background overflow-x-hidden">
				{/* Header */}
				<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 shrink-0">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1">
							<h1 className="text-3xl font-black text-foreground tracking-tight font-display">
								matric mastery
							</h1>
							<p className="text-muted-foreground font-medium flex items-center gap-1.5 text-sm">
								keep up the streak!{' '}
								<HugeiconsIcon
									icon={FireIcon}
									className="w-4 h-4 text-brand-amber fill-brand-amber"
								/>{' '}
								<span className="font-bold text-foreground">5 days</span>
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="rounded-full bg-card border-border shadow-sm gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4"
						>
							<HugeiconsIcon icon={GlobeIcon} className="w-4 h-4 text-muted-foreground" />
							<span className="font-bold text-foreground hidden sm:inline">english</span>
							<HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-muted-foreground/50" />
						</Button>
					</div>

					{/* Category selector */}
					<nav
						className="flex gap-2 sm:gap-3 mt-6 sm:mt-8 overflow-x-auto no-scrollbar"
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
				</header>

				{/* Path Content */}
				<div className="flex-1">
					<main className="px-4 sm:px-6 py-4 relative">
						{/* Vertical Line */}
						<div className="absolute left-9.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-border/50 z-0" />

						<div className="space-y-6">
							{filteredLessons.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-muted-foreground">No lessons found for this category</p>
								</div>
							) : (
								filteredLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
							)}

							{/* Premium Upsell Card */}
							<PremiumUpsell />
						</div>

						{/* Space for bottom nav */}
						<div className="h-32" />
					</main>
				</div>
				<ContextualAIBubble />
			</div>
		</ViewTransition>
	);
}
