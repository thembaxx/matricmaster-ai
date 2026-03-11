'use client';

import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/stores/useScheduleStore';
import type { StudyTask } from '@/types/schedule';

interface TaskChecklistProps {
	task: StudyTask;
}

export function TaskChecklist({ task }: TaskChecklistProps) {
	const { toggleStep } = useSchedule();

	return (
		<div className="space-y-2">
			{task.steps.map((step, index) => (
				<m.button
					key={step.id}
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: index * 0.05 }}
					onClick={() => toggleStep(task.id, step.id)}
					className={cn(
						'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
						'hover:bg-muted/50 text-left'
					)}
				>
					<div
						className={cn(
							'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
							step.completed ? 'bg-success border-success' : 'border-muted-foreground/30'
						)}
					>
						{step.completed && (
							<svg
								className="w-3 h-3 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						)}
					</div>
					<span
						className={cn(
							'text-sm transition-all',
							step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
						)}
					>
						{step.title}
					</span>
				</m.button>
			))}
		</div>
	);
}
