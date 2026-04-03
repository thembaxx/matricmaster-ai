'use client';

import { CheckmarkCircle02Icon, Drag04Icon as GripVerticalIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

const SUBJECT_STYLES: Record<string, { bg: string; border: string; text: string; accent: string }> =
	{
		Mathematics: {
			bg: 'bg-blue-50 dark:bg-blue-950/30',
			border: 'border-blue-200 dark:border-blue-800',
			text: 'text-blue-700 dark:text-blue-300',
			accent: 'bg-blue-500',
		},
		'Physical Sciences': {
			bg: 'bg-emerald-50 dark:bg-emerald-950/30',
			border: 'border-emerald-200 dark:border-emerald-800',
			text: 'text-emerald-700 dark:text-emerald-300',
			accent: 'bg-emerald-500',
		},
		'Life Sciences': {
			bg: 'bg-purple-50 dark:bg-purple-950/30',
			border: 'border-purple-200 dark:border-purple-800',
			text: 'text-purple-700 dark:text-purple-300',
			accent: 'bg-purple-500',
		},
		Geography: {
			bg: 'bg-amber-50 dark:bg-amber-950/30',
			border: 'border-amber-200 dark:border-amber-800',
			text: 'text-amber-700 dark:text-amber-300',
			accent: 'bg-amber-500',
		},
		History: {
			bg: 'bg-red-50 dark:bg-red-950/30',
			border: 'border-red-200 dark:border-red-800',
			text: 'text-red-700 dark:text-red-300',
			accent: 'bg-red-500',
		},
		English: {
			bg: 'bg-indigo-50 dark:bg-indigo-950/30',
			border: 'border-indigo-200 dark:border-indigo-800',
			text: 'text-indigo-700 dark:text-indigo-300',
			accent: 'bg-indigo-500',
		},
		Accounting: {
			bg: 'bg-teal-50 dark:bg-teal-950/30',
			border: 'border-teal-200 dark:border-teal-800',
			text: 'text-teal-700 dark:text-teal-300',
			accent: 'bg-teal-500',
		},
		Economics: {
			bg: 'bg-orange-50 dark:bg-orange-950/30',
			border: 'border-orange-200 dark:border-orange-800',
			text: 'text-orange-700 dark:text-orange-300',
			accent: 'bg-orange-500',
		},
		Chemistry: {
			bg: 'bg-pink-50 dark:bg-pink-950/30',
			border: 'border-pink-200 dark:border-pink-800',
			text: 'text-pink-700 dark:text-pink-300',
			accent: 'bg-pink-500',
		},
	};

export function StudyBlockCard({ block, compact = false }: StudyBlockCardProps) {
	const { saveBlock, deleteBlock, toggleBlockComplete } = useSmartSchedulerStore();
	const { startDrag, endDrag, isDragging } = useDragStore();
	const [editorOpen, setEditorOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

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
		setIsSaving(true);
		try {
			await saveBlock({ ...updates, id: block.id });
			setEditorOpen(false);
			toast.success('Block updated');
		} catch (error) {
			console.error('Failed to update block:', error);
			toast.error('Failed to update block');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteBlock(block.id);
			setEditorOpen(false);
			toast.success('Block removed');
		} catch (error) {
			console.error('Failed to remove block:', error);
			toast.error('Failed to remove block');
		}
	};

	const cardContent = (
		<>
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 min-w-0">
					<div className={cn('w-1.5 h-6 rounded-full flex-shrink-0', style.accent)} />
					<div className="min-w-0">
						<h4 className={cn('font-semibold text-sm', style.text)}>{block.subject}</h4>
						{block.topic && (
							<p className="text-xs text-muted-foreground truncate mt-0.5">{block.topic}</p>
						)}
					</div>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={(e) => {
						e.stopPropagation();
						toggleBlockComplete(block.id);
					}}
					className={cn(
						'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
						block.isCompleted
							? 'bg-green-500 border-green-500'
							: 'border-muted-foreground/30 hover:border-green-400'
					)}
				>
					{block.isCompleted && (
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5 text-white" />
					)}
				</Button>
			</div>
			<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
				<span className="font-medium">{block.startTime}</span>
				<span>—</span>
				<span>{block.endTime}</span>
				<span className="text-muted-foreground/60">·</span>
				<span>{block.duration}m</span>
				{block.isAISuggested && (
					<>
						<span className="text-muted-foreground/60">·</span>
						<span className="text-primary font-medium">AI</span>
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
						aria-label={`Edit ${block.subject} study block`}
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								setEditorOpen(true);
							}
						}}
						className={cn(
							'group rounded-lg border p-1.5 cursor-pointer transition-all hover:shadow-sm active:scale-[0.98]',
							'border-l-2',
							style.bg,
							style.border,
							block.isCompleted && 'opacity-60',
							isDragging && 'opacity-50 scale-95'
						)}
					>
						<div className="flex items-center gap-1.5">
							<HugeiconsIcon
								icon={GripVerticalIcon}
								className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors"
							/>
							<span className={cn('font-semibold text-xs truncate flex-1', style.text)}>
								{block.subject}
							</span>
							<span className="text-[10px] text-muted-foreground font-medium">
								{block.startTime}
							</span>
						</div>
					</div>
				</PopoverTrigger>
				<PopoverContent align="end" className="w-auto p-0">
					<BlockEditor
						block={block}
						onSave={handleSave}
						onDelete={handleDelete}
						onClose={() => setEditorOpen(false)}
						isSaving={isSaving}
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
					aria-label={`Edit ${block.subject} study block`}
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							setEditorOpen(true);
						}
					}}
					className={cn(
						'group rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]',
						'border-l-[3px]',
						style.bg,
						style.border,
						block.isCompleted && 'opacity-70',
						isDragging && 'opacity-50 scale-95 shadow-lg'
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
					isSaving={isSaving}
				/>
			</PopoverContent>
		</Popover>
	);
}
