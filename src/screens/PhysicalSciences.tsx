'use client';

import {
	ArrowLeft02Icon,
	Download01Icon,
	LayoutLeftIcon,
	MoonIcon,
	Settings01Icon,
	SparklesIcon,
	Sun01Icon,
	ViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { CircuitQuestion } from '@/components/PhysicalSciences/CircuitQuestion';
import { LabSimulations } from '@/components/PhysicalSciences/LabSimulations';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePhysicalSciences } from '@/hooks/usePhysicalSciences';

export default function PhysicalSciences() {
	const router = useRouter();
	const {
		theme,
		toggleTheme,
		viewMode,
		setViewMode,
		showAnnotations,
		setShowAnnotations,
		activeSimulation,
		setActiveSimulation,
	} = usePhysicalSciences();

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
							<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
						</Button>
						<h1 className="text-2xl font-bold text-foreground tracking-tight">physics p1</h1>
					</div>
					<div className="flex gap-2">
						<Button variant="ghost" size="icon">
							<HugeiconsIcon icon={Settings01Icon} className="w-5 h-5" />
						</Button>
						<Button variant="ghost" size="icon" onClick={toggleTheme}>
							{theme === 'dark' ? (
								<HugeiconsIcon icon={Sun01Icon} className="w-5 h-5" />
							) : (
								<HugeiconsIcon icon={MoonIcon} className="w-5 h-5" />
							)}
						</Button>
						<Button variant="ghost" size="icon">
							<HugeiconsIcon icon={Download01Icon} className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Quick Action */}
				<div className="mb-4">
					<Button
						variant="gradient"
						className="w-full rounded-2xl font-bold h-12 gap-2 shadow-xl shadow-primary/20"
						onClick={() => router.push('/quiz')}
					>
						<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
						practice quiz
					</Button>
				</div>

				{/* View Toggle */}
				<Tabs
					value={viewMode}
					onValueChange={(v) => setViewMode(v as 'question' | 'split' | 'simulations')}
					className="w-full"
				>
					<TabsList className="grid grid-cols-3 w-full">
						<TabsTrigger value="question" className="flex items-center gap-2">
							<HugeiconsIcon icon={ViewIcon} className="w-4 h-4" />
							questions
						</TabsTrigger>
						<TabsTrigger value="split" className="flex items-center gap-2">
							<HugeiconsIcon icon={LayoutLeftIcon} className="w-4 h-4" />
							split
						</TabsTrigger>
						<TabsTrigger value="simulations" className="flex items-center gap-2">
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
							lab sims
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-12">
					{viewMode !== 'simulations' ? (
						<CircuitQuestion
							showAnnotations={showAnnotations}
							setShowAnnotations={setShowAnnotations}
							viewMode={viewMode}
						/>
					) : (
						<LabSimulations
							activeSimulation={activeSimulation}
							setActiveSimulation={setActiveSimulation}
						/>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
