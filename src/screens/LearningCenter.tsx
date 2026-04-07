'use client';

import {
	ArrowDown01Icon,
	BookOpen01Icon,
	FireIcon,
	GlobeIcon,
	GridIcon,
	MapsIcon,
	Medal01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState, ViewTransition } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLessons } from '@/hooks/useLessons';
import CurriculumMapView from './LearningCenter/CurriculumMapView';
// We will create sub-components for each view to keep this clean
// In a real implementation, these would be in their own files
import LessonsBrowser from './LearningCenter/LessonsBrowser';
import StudyPathView from './LearningCenter/StudyPathView';

type LearningView = 'browser' | 'path' | 'map';

export default function LearningCenter() {
	const [currentView, setCurrentView] = useState<LearningView>('browser');
	const { activeCategory, setActiveCategory, filteredLessons, loading } = useLessons();

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

					{/* View Switcher - The core of consolidation */}
					<div className="flex p-1 bg-muted/50 rounded-full w-fit mt-6 sm:mt-8 border border-border/50">
						{[
							{ id: 'browser', label: 'browser', icon: BookOpen01Icon },
							{ id: 'path', label: 'path', icon: MapsIcon },
							{ id: 'map', label: 'map', icon: GridIcon },
						].map((view) => (
							<Button
								key={view.id}
								variant="ghost"
								onClick={() => setCurrentView(view.id as LearningView)}
								className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
									currentView === view.id
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<HugeiconsIcon icon={view.icon} className="w-3.5 h-3.5" />
								{view.label}
							</Button>
						))}
					</div>
				</header>

				<ScrollArea className="flex-1">
					<main className="px-4 sm:px-6 py-4 relative">
						{currentView === 'browser' && (
							<LessonsBrowser
								activeCategory={activeCategory}
								setActiveCategory={setActiveCategory}
								filteredLessons={filteredLessons}
								loading={loading}
							/>
						)}
						{currentView === 'path' && <StudyPathView />}
						{currentView === 'map' && <CurriculumMapView />}

						{/* Global Premium Upsell - now shared across all views */}
						<div className="flex gap-6 relative z-10 pt-4">
							<div className="w-8 shrink-0" />
							<Card className="flex-1 bg-foreground text-background p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden shadow-elevation-3 border-none">
								<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
								<div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
								<div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group hover:scale-105 transition-transform">
									<HugeiconsIcon icon={Medal01Icon} className="w-8 h-8 text-yellow-400" />
									<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-foreground" />
								</div>
								<div className="space-y-2">
									<h3 className="text-2xl font-black tracking-tight">unlock past papers</h3>
									<p className="text-muted-foreground font-medium text-sm px-4">
										get access to 2018-2023 exams with memos.
									</p>
									<Button className="w-full bg-background text-foreground hover:bg-muted h-14 rounded-2xl font-black text-lg shadow-elevation-2 transition-all active:scale-[0.98]">
										go premium
									</Button>
								</div>
							</Card>
						</div>
						<div className="h-32" />
					</main>
				</ScrollArea>
				<ContextualAIBubble />
			</div>
		</ViewTransition>
	);
}
