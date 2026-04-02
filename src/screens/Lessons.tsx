'use client';

import {
	ArrowDown01Icon,
	Chemistry01Icon,
	FireIcon,
	GlobeIcon,
	LayoutLeftIcon,
	Medal01Icon,
	TranslateIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewTransition } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { LessonCard } from '@/components/Lessons/LessonCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
							<h1 className="text-2xl font-black text-foreground tracking-tight">grade 12 prep</h1>
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
				<ScrollArea className="flex-1">
					<main className="px-4 sm:px-6 py-4 relative">
						{/* Vertical Line */}
						<div className="absolute left-9.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-border/50 z-0" />

						<div className="space-y-6">
							{filteredLessons.map((lesson) => (
								<LessonCard key={lesson.id} lesson={lesson} />
							))}

							{/* Premium Upsell Card */}
							<div className="flex gap-6 relative z-10 pt-4">
								<div className="w-8 shrink-0" /> {/* Spacer for alignment */}
								<Card className="flex-1 bg-foreground text-background p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden shadow-2xl border-none">
									<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
									<div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

									<div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group cursor-pointer hover:scale-105 transition-transform">
										<HugeiconsIcon icon={Medal01Icon} className="w-8 h-8 text-yellow-400" />
										<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-foreground" />
									</div>

									<div className="space-y-2">
										<h3 className="text-2xl font-black tracking-tight">unlock past papers</h3>
										<p className="text-muted-foreground font-medium text-sm px-4">
											get access to 2018-2023 exams with memos.
										</p>

										<Button className="w-full bg-background text-foreground hover:bg-muted h-14 rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all active:scale-[0.98]">
											go premium
										</Button>
									</div>
								</Card>
							</div>
						</div>

						{/* Space for bottom nav */}
						<div className="h-32" />
					</main>
				</ScrollArea>
				<ContextualAIBubble />
			</div>
		</ViewTransition>
	);
}
