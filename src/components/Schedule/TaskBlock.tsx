'use client';

import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type StudyTask, SUBJECTS } from '@/types/schedule';

interface TaskBlockProps {
	task: StudyTask;
	isActive?: boolean;
	completed?: boolean;
	showTime?: boolean;
	onClick?: () => void;
	onComplete?: () => void;
	onRemove?: () => void;
}

export function TaskBlock({
	task,
	isActive = false,
	completed = false,
	showTime: _showTime = false,
	onClick,
	onComplete,
	onRemove,
}: TaskBlockProps) {
	const subject = SUBJECTS[task.subject];

	return (
		<m.div
			layout
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			onClick={onClick}
			className={cn(
				'group relative p-4 rounded-2xl cursor-pointer transition-all duration-200',
				'border border-border/50',
				isActive
					? 'bg-card shadow-lg ring-2 ring-primary/30'
					: 'bg-card/60 hover:bg-card hover:shadow-md'
			)}
		>
			<div className="flex items-center gap-3">
				{!completed && onComplete && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onComplete();
						}}
						className={cn(
							'w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors',
							'border-muted-foreground/30 hover:border-primary hover:bg-primary/10'
						)}
					/>
				)}
				{completed && (
					<div className="w-6 h-6 rounded-full bg-success flex-shrink-0 flex items-center justify-center">
						<svg
							className="w-4 h-4 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				)}

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xl">{subject?.emoji}</span>
						<h3
							className={cn(
								'font-medium truncate',
								completed ? 'line-through text-muted-foreground' : 'text-foreground'
							)}
						>
							{task.title}
						</h3>
					</div>
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<span>{task.duration} min</span>
						<span
							className={cn('px-2 py-0.5 rounded-full text-xs', subject?.bgColor, subject?.color)}
						>
							{subject?.name}
						</span>
					</div>
				</div>

				{onRemove && !completed && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
					>
						<svg
							className="w-4 h-4 text-destructive"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				)}
			</div>
		</m.div>
	);
}
