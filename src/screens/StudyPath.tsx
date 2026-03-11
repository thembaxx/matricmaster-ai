'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface JourneyStep {
	id: string;
	emoji: string;
	title: string;
	description: string;
	duration: string;
	status: 'completed' | 'current' | 'locked';
	progress?: number;
}

interface JourneyModule {
	id: string;
	title: string;
	emoji: string;
	progress: number;
	steps: JourneyStep[];
}

const DEMO_JOURNEY: JourneyModule = {
	id: '1',
	title: 'Calculus fundamentals',
	emoji: '🧮',
	progress: 45,
	steps: [
		{
			id: '1',
			emoji: '📖',
			title: 'Review notes',
			description: 'Read through your calculus notes',
			duration: '15 min',
			status: 'completed',
		},
		{
			id: '2',
			emoji: '🎬',
			title: 'Watch video',
			description: 'Understand the core concepts',
			duration: '20 min',
			status: 'completed',
		},
		{
			id: '3',
			emoji: '✍️',
			title: 'Practice problems',
			description: 'Apply what you learned',
			duration: '30 min',
			status: 'current',
			progress: 40,
		},
		{
			id: '4',
			emoji: '✅',
			title: 'Take quiz',
			description: 'Test your understanding',
			duration: '15 min',
			status: 'locked',
		},
		{
			id: '5',
			emoji: '🎯',
			title: 'Mock exam',
			description: 'Full practice test',
			duration: '45 min',
			status: 'locked',
		},
	],
};

export default function StudyPath() {
	const router = useRouter();
	const [journey] = useState(DEMO_JOURNEY);
	const [expandedStep, setExpandedStep] = useState<string | null>(null);

	const toggleStep = (stepId: string) => {
		setExpandedStep(expandedStep === stepId ? null : stepId);
	};

	const completedSteps = journey.steps.filter((s) => s.status === 'completed').length;
	const totalSteps = journey.steps.length;
	const progressPercent = (completedSteps / totalSteps) * 100;

	return (
		<div className="min-h-screen bg-background">
			<TimelineSidebar />

			<FocusContent>
				{/* Header */}
				<m.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
					<div className="flex items-center gap-3 mb-4">
						<span className="text-4xl">{journey.emoji}</span>
						<div>
							<h1 className="text-2xl font-display font-bold">{journey.title}</h1>
							<p className="text-sm text-muted-foreground">Your learning journey</p>
						</div>
					</div>

					{/* Progress */}
					<div className="bg-card rounded-2xl p-4 border border-border">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Progress</span>
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

				<ScrollArea className="h-[calc(100vh-320px)]">
					<div className="space-y-4">
						{journey.steps.map((step, index) => (
							<JourneyStepCard
								key={step.id}
								step={step}
								index={index}
								isExpanded={expandedStep === step.id}
								onToggle={() => toggleStep(step.id)}
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
						{journey.steps.find((s) => s.status === 'current') ? (
							<>Continue learning →</>
						) : (
							<>Start journey →</>
						)}
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
}: {
	step: JourneyStep;
	index: number;
	isExpanded: boolean;
	onToggle: () => void;
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
						onClick={() => {}}
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
