'use client';

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDragStore } from '@/stores/useDragStore';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import type { StudyBlock } from '@/types/smart-scheduler';
import { BlockEditor } from './BlockEditor';

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
	English: { bg: 'bg-indigo-500/10', border: 'border-indigo-500', text: 'text-indigo-600' },
	Accounting: { bg: 'bg-teal-500/10', border: 'border-teal-500', text: 'text-teal-600' },
	Economics: { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-600' },
	Chemistry: { bg: 'bg-pink-500/10', border: 'border-pink-500', text: 'text-pink-600' },
};

export function StudyBlockCard({ block, compact = false }: StudyBlockCardProps) {
	const { saveBlock, removeBlock } = useSmartSchedulerStore();
	const { startDrag, endDrag, isDragging } = useDragStore();
	const [editorOpen, setEditorOpen] = useState(false);

	const style = SUBJECT_STYLES[block.subject] || SUBJECT_STYLES.Mathematics;

	const handleDragStart = (e: React.DragEvent) => {
		e.dataTransfer.setData('blockId', block.id);
		e.dataTransfer.effectAllowed = 'move';
		startDrag(block.id);
	};

	const handleDragEnd = () => {
		endDrag();
	};

	const handleSave = async (updates: Partial<StudyBlock>) => {
		await saveBlock({ ...updates, id: block.id });
		setEditorOpen(false);
	};

	const handleDelete = () => {
		removeBlock(block.id);
		setEditorOpen(false);
	};

	const cardContent = (
		<>
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
		</>
	);

	if (compact) {
		return (
			<Popover open={editorOpen} onOpenChange={setEditorOpen}>
				<PopoverTrigger asChild>
					<div
						draggable
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
							}
						}}
						className={cn(
							'rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity border text-left w-full',
							style.bg,
							block.isCompleted && 'opacity-50 line-through',
							isDragging && 'opacity-50'
						)}
					>
						<div className={cn('font-medium truncate', style.text)}>{block.subject}</div>
						<div className="text-[10px] text-muted-foreground">{block.startTime}</div>
					</div>
				</PopoverTrigger>
				<PopoverContent align="end" className="w-auto p-0">
					<BlockEditor
						block={block}
						onSave={handleSave}
						onDelete={handleDelete}
						onClose={() => setEditorOpen(false)}
					/>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Popover open={editorOpen} onOpenChange={setEditorOpen}>
			<PopoverTrigger asChild>
				<div
					draggable
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
						}
					}}
					className={cn(
						'rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow text-left w-full',
						style.bg,
						style.border,
						block.isCompleted && 'opacity-60',
						isDragging && 'opacity-50'
					)}
				>
					{cardContent}
				</div>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-auto p-0">
				<BlockEditor
					block={block}
					onSave={handleSave}
					onDelete={handleDelete}
					onClose={() => setEditorOpen(false)}
				/>
			</PopoverContent>
		</Popover>
	);
}
