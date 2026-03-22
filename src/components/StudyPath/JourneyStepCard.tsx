'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JourneyStep {
	id: string;
	emoji: string;
	title: string;
	description: string;
	duration: string;
	status: 'completed' | 'current' | 'locked';
	progress?: number;
	type: 'lesson' | 'practice' | 'quiz';
	durationMinutes: number;
}

interface JourneyStepCardProps {
	step: JourneyStep;
	index: number;
	isExpanded: boolean;
	onToggle: () => void;
	onNavigate: (path: string) => void;
}

export function JourneyStepCard({
	step,
	index,
	isExpanded,
	onToggle,
	onNavigate,
}: JourneyStepCardProps) {
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
			<Button
				type="button"
				variant="ghost"
				onClick={onToggle}
				disabled={step.status === 'locked'}
				className="w-full flex items-center gap-4 p-4"
			>
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
							aria-label="Locked step"
						>
							<title>Locked</title>
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

				<div className="flex-1 text-left">
					<h3 className="font-semibold text-foreground">{step.title}</h3>
					<p className="text-sm text-muted-foreground">{step.duration}</p>
				</div>

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
			</Button>

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
