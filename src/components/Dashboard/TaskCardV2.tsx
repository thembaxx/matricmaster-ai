'use client';

import { CheckmarkCircle02Icon, CircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { cn } from '@/lib/utils';

type IconSvgElement = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export interface StudyTask {
	id: string;
	title: string;
	subject: string;
	icon: IconSvgElement;
	duration: string;
	priority: 'high' | 'medium' | 'low';
	completed: boolean;
	color: string;
}

interface TaskCardProps {
	task: StudyTask;
	index: number;
	onToggle: () => void;
}

export function TaskCard({ task, index, onToggle }: TaskCardProps) {
	return (
		<m.div
			layout
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 10 }}
			transition={{ delay: index * 0.05 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				'relative pl-6 pr-4 py-4 bg-card rounded-2xl shadow-tiimo border border-border/50 flex items-center gap-4 transition-all group overflow-hidden tiimo-press',
				task.completed && 'opacity-60 grayscale-[0.2]'
			)}
		>
			<div className={cn('absolute left-0 top-0 bottom-0 w-2 rounded-r-full', task.color)} />

			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onToggle();
				}}
				className={cn(
					'tiimo-checkbox shrink-0 scale-75',
					task.completed && 'checked bg-tiimo-green border-tiimo-green'
				)}
			>
				{task.completed ? (
					<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-white" />
				) : (
					<HugeiconsIcon icon={CircleIcon} className="w-5 h-5 text-tiimo-gray-subtle" />
				)}
			</button>

			<div className="flex-1 min-w-0">
				<h3
					className={cn(
						'text-base font-medium transition-all',
						task.completed ? 'text-tiimo-gray-muted line-through' : 'text-foreground'
					)}
				>
					{task.title}
				</h3>
				<div className="flex items-center gap-2 mt-0.5">
					<span className="text-[10px] text-tiimo-gray-muted bg-secondary px-2 py-0.5 rounded-md">
						{task.subject}
					</span>
					<span className="text-[10px] text-tiimo-gray-muted/70">{task.duration}</span>
				</div>
			</div>

			<div
				className={cn(
					'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110',
					task.color.replace('bg-', 'bg-').concat('/15')
				)}
			>
				<HugeiconsIcon
					icon={task.icon}
					className={cn('w-6 h-6', task.color.replace('bg-', 'text-'))}
				/>
			</div>
		</m.div>
	);
}
