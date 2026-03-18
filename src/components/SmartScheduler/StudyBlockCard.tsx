'use client';

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import type { StudyBlock } from '@/types/smart-scheduler';

interface StudyBlockCardProps {
	block: StudyBlock;
	compact?: boolean;
}

const SUBJECT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
	Mathematics: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-600' },
	'Physical Sciences': {
		bg: 'bg-emerald-500/10',
		border: 'border-emerald-500',
		text: 'text-emerald-600',
	},
	'Life Sciences': { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-600' },
	Geography: { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-600' },
	History: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-600' },
};

export function StudyBlockCard({ block, compact = false }: StudyBlockCardProps) {
	const { toggleBlockComplete } = useSmartSchedulerStore();
	const style = SUBJECT_STYLES[block.subject] || SUBJECT_STYLES.Mathematics;

	if (compact) {
		return (
			<button
				type="button"
				className={cn(
					'rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity border text-left w-full',
					style.bg,
					block.isCompleted && 'opacity-50 line-through'
				)}
				onClick={() => toggleBlockComplete(block.id)}
			>
				<div className={cn('font-medium truncate', style.text)}>{block.subject}</div>
				<div className="text-[10px] text-muted-foreground">{block.startTime}</div>
			</button>
		);
	}

	return (
		<button
			type="button"
			className={cn(
				'rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow text-left w-full',
				style.bg,
				style.border,
				block.isCompleted && 'opacity-60'
			)}
			onClick={() => toggleBlockComplete(block.id)}
		>
			<div className="flex items-start justify-between">
				<div>
					<h4 className={cn('font-medium', style.text)}>{block.subject}</h4>
					{block.topic && <p className="text-sm text-muted-foreground mt-0.5">{block.topic}</p>}
				</div>
				<div
					className={cn(
						'w-6 h-6 rounded-full border-2 flex items-center justify-center',
						block.isCompleted ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30'
					)}
				>
					{block.isCompleted && (
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-white" />
					)}
				</div>
			</div>
			<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
				<span>
					{block.startTime} - {block.endTime}
				</span>
				<span>·</span>
				<span>{block.duration} min</span>
				{block.isAISuggested && (
					<>
						<span>·</span>
						<span className="text-primary">AI</span>
					</>
				)}
			</div>
		</button>
	);
}
