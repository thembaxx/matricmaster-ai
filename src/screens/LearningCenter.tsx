'use client';

import {
	ArrowDown01Icon,
	BookOpen01Icon,
	FireIcon,
	GlobeIcon,
	GridIcon,
	MapsIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState, ViewTransition } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { Button } from '@/components/ui/button';
import { PremiumUpsell } from '@/components/ui/PremiumUpsell';
import { useLessons } from '@/hooks/useLessons';
import CurriculumMapView from './LearningCenter/CurriculumMapView';
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

				<div className="flex-1">
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
						<PremiumUpsell />
						<div className="h-32" />
					</main>
				</div>
				<ContextualAIBubble />
			</div>
		</ViewTransition>
	);
}
