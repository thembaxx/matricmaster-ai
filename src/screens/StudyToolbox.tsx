'use client';

import { BookmarkIcon, GridIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState, ViewTransition } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Bookmarks from '@/screens/Bookmarks';
import PeriodicTable from '@/screens/PeriodicTable';
// Component imports for the tools
import SnapAndSolve from '@/screens/SnapAndSolve';

type ToolView = 'snap' | 'periodic' | 'bookmarks';

export default function StudyToolbox() {
	const [currentTool, setCurrentTool] = useState<ToolView>('snap');

	return (
		<ViewTransition default="none">
			<div className="vt-nav-forward flex flex-col h-full min-w-0 bg-background overflow-x-hidden">
				<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 shrink-0">
					<div className="space-y-1">
						<h1 className="text-3xl font-black text-foreground tracking-tight font-display">
							study toolbox
						</h1>
						<p className="text-muted-foreground font-medium text-sm">
							high-efficiency aids for your matric prep
						</p>
					</div>

					{/* Tool Switcher */}
					<div className="flex p-1 bg-muted/50 rounded-full w-fit mt-6 sm:mt-8 border border-border/50">
						{[
							{ id: 'snap', label: 'snap & solve', icon: SparklesIcon },
							{ id: 'periodic', label: 'periodic table', icon: GridIcon },
							{ id: 'bookmarks', label: 'bookmarks', icon: BookmarkIcon },
						].map((tool) => (
							<Button
								key={tool.id}
								variant="ghost"
								onClick={() => setCurrentTool(tool.id as ToolView)}
								className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
									currentTool === tool.id
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<HugeiconsIcon icon={tool.icon} className="w-3.5 h-3.5" />
								{tool.label}
							</Button>
						))}
					</div>
				</header>

				<ScrollArea className="flex-1">
					<main className="px-4 sm:px-6 py-4 relative">
						<div className="transition-all duration-300">
							{currentTool === 'snap' && <SnapAndSolve />}
							{currentTool === 'periodic' && <PeriodicTable />}
							{currentTool === 'bookmarks' && <Bookmarks />}
						</div>

						<div className="h-32" />
					</main>
				</ScrollArea>
				<ContextualAIBubble />
			</div>
		</ViewTransition>
	);
}
