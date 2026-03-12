'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import studyPathsData from '@/constants/study-paths.json';

interface JourneyStep {
	id: string;
	emoji: string;
	title: string;
	description: string;
	duration: string;
	status: 'completed' | 'current' | 'locked';
	progress?: number;
	type: 'lesson' | 'practice' | 'quiz';
}

interface JourneyModule {
	id: string;
	title: string;
	description: string;
	progress: number;
	steps: JourneyStep[];
}

interface StudyPathScreenProps {
	pathId?: string;
}

export default function StudyPath({ pathId = 'math-p1-mastery' }: StudyPathScreenProps) {
	const router = useRouter();
	
	// Load data from JSON
	const pathData = studyPathsData.studyPaths.find(p => p.id === pathId) || studyPathsData.studyPaths[0];
	
	// Map JSON structure to UI structure
	// For this UI, we'll flatten the modules into a single list of steps or show one module at a time
	// Let's show the first incomplete module or the first one if all complete
	const [activeModuleIndex, setActiveModuleIndex] = useState(0);
	const [expandedStep, setExpandedStep] = useState<string | null>(null);

	const module = pathData.modules[activeModuleIndex];
	
	const steps: JourneyStep[] = module.steps.map((step, idx) => ({
		id: `${module.id}-${idx}`,
		emoji: step.type === 'lesson' ? '📖' : step.type === 'quiz' ? '✅' : '✍️',
		title: step.title,
		description: step.type === 'lesson' ? 'Learn core concepts' : 'Apply your knowledge',
		duration: `${step.duration} min`,
		status: idx === 0 ? 'current' : 'locked', // Mock status logic
		type: step.type as 'lesson' | 'practice' | 'quiz',
	}));

	const toggleStep = (stepId: string) => {
		setExpandedStep(expandedStep === stepId ? null : stepId);
	};

	const completedSteps = steps.filter((s) => s.status === 'completed').length;
	const totalSteps = steps.length;
	const progressPercent = (completedSteps / totalSteps) * 100;

	return (
		<div className="min-h-screen bg-background">
			<TimelineSidebar />

			<FocusContent>
				{/* Header */}
				<m.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
					<div className="flex items-center gap-3 mb-4">
						<span className="text-4xl">{pathData.icon}</span>
						<div>
							<h1 className="text-2xl font-display font-bold">{pathData.title}</h1>
							<p className="text-sm text-muted-foreground">{module.title}</p>
						</div>
					</div>

					{/* Module Selector */}
					<div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
						{pathData.modules.map((m, idx) => (
							<Button
								key={m.id}
								variant={activeModuleIndex === idx ? "default" : "outline"}
								size="sm"
								className="rounded-full whitespace-nowrap"
								onClick={() => setActiveModuleIndex(idx)}
							>
								Module {idx + 1}
							</Button>
						))}
					</div>

					{/* Progress */}
					<div className="bg-card rounded-2xl p-4 border border-border">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Module Progress</span>
							<span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
						</div>
						<div className="h-3 bg-muted rounded-full overflow-hidden">
							<m.div
								className="h-full bg-primary rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${progressPercent}%` }}
								transition={{ duration: 0.8, ease: 'easeOut' }}
							/>
						</div>
						<p className="text-xs text-muted-foreground mt-2">
							{completedSteps} of {totalSteps} steps completed
						</p>
					</div>
				</m.header>

				<ScrollArea className="h-[calc(100vh-380px)]">
					<div className="space-y-4">
						{steps.map((step, index) => (
							<JourneyStepCard
								key={step.id}
								step={step}
								index={index}
								isExpanded={expandedStep === step.id}
								onToggle={() => toggleStep(step.id)}
								onNavigate={(path) => router.push(path)}
							/>
						))}
					</div>
				</ScrollArea>

				{/* Action Button */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="mt-6"
				>
					<Button
						size="lg"
						className="w-full rounded-2xl h-14 text-lg"
						onClick={() => router.push('/focus')}
					>
						{steps.find((s) => s.status === 'current')
							? 'Continue learning →'
							: 'Start journey →'}
					</Button>
				</m.div>
			</FocusContent>
		</div>
	);
}

function JourneyStepCard({
	step,
	index,
	isExpanded,
	onToggle,
	onNavigate,
}: {
	step: JourneyStep;
	index: number;
	isExpanded: boolean;
	onToggle: () => void;
	onNavigate: (path: string) => void;
}) {
	const statusStyles = {
		completed: 'bg-success-soft border-success/30',
		current: 'bg-primary-soft border-primary',
		locked: 'bg-muted border-border opacity-60',
	};

	const iconBgStyles = {
		completed: 'bg-success',
		current: 'bg-primary',
		locked: 'bg-muted-foreground',
	};

	const handleAction = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (step.title.toLowerCase().includes('quiz') || step.title.toLowerCase().includes('exam')) {
			onNavigate('/quiz');
		} else {
			onNavigate('/focus');
		}
	};

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			className={cn(
				'rounded-2xl border-2 transition-all overflow-hidden',
				statusStyles[step.status]
			)}
		>
			{/* Main Row */}
			<button
				type="button"
				onClick={onToggle}
				disabled={step.status === 'locked'}
				className="w-full flex items-center gap-4 p-4"
			>
				{/* Huge Checkbox Circle */}
				<div
					className={cn(
						'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
						iconBgStyles[step.status]
					)}
				>
					{step.status === 'completed' ? (
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={3}
							aria-label="Completed"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					) : step.status === 'locked' ? (
						<svg
							className="w-5 h-5 text-muted-foreground"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
							aria-label="Locked"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					) : (
						<span className="text-xl">{step.emoji}</span>
					)}
				</div>

				{/* Content */}
				<div className="flex-1 text-left">
					<h3 className="font-semibold text-foreground">{step.title}</h3>
					<p className="text-sm text-muted-foreground">{step.duration}</p>
				</div>

				{/* Progress or Arrow */}
				{step.status === 'current' && step.progress !== undefined && (
					<div className="w-16">
						<div className="h-2 bg-border rounded-full overflow-hidden">
							<div
								className="h-full bg-primary rounded-full"
								style={{ width: `${step.progress}%` }}
							/>
						</div>
					</div>
				)}

				{step.status !== 'locked' && (
					<span className="text-muted-foreground">{isExpanded ? '▲' : '▼'}</span>
				)}
			</button>

			{/* Expanded Details */}
			{isExpanded && step.status !== 'locked' && (
				<m.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					className="px-4 pb-4 pt-2 border-t border-border/30"
				>
					<p className="text-sm text-muted-foreground mb-3">{step.description}</p>
					{step.status === 'current' && step.progress !== undefined && (
						<div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
							<div
								className="h-full bg-primary rounded-full transition-all"
								style={{ width: `${step.progress}%` }}
							/>
						</div>
					)}
					<Button
						size="sm"
						className="w-full rounded-xl"
						variant={step.status === 'completed' ? 'outline' : 'default'}
						onClick={handleAction}
					>
						{step.status === 'completed'
							? 'Review again'
							: step.status === 'current'
								? 'Continue'
								: 'Start'}
					</Button>
				</m.div>
			)}
		</m.div>
	);
}
