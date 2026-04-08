'use client';

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, m } from 'framer-motion';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
	id: string;
	text: string;
	year?: string;
	description?: string;
}

interface TimelineSorterProps {
	events: TimelineEvent[];
	correctOrder: string[];
	isChecked: boolean;
	onChange: (order: string[]) => void;
}

function SortableItem({
	event,
	index,
	isChecked,
	correctOrder,
}: {
	event: TimelineEvent;
	index: number;
	isChecked: boolean;
	correctOrder: string[];
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: event.id,
		disabled: isChecked,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : undefined,
	};

	const isCorrectPosition = isChecked && correctOrder[index] === event.id;
	const isWrongPosition = isChecked && correctOrder[index] !== event.id;

	return (
		<m.div
			ref={setNodeRef}
			style={style}
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.05, duration: 0.25 }}
			className={cn(
				'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
				isDragging && 'shadow-xl ring-2 ring-primary/30',
				isCorrectPosition && 'border-emerald-500/50 bg-emerald-500/5',
				isWrongPosition && 'border-red-500/50 bg-red-500/5',
				!isChecked && 'border-border/50 bg-card hover:border-border',
				!isChecked && 'cursor-grab active:cursor-grabbing'
			)}
			{...attributes}
			{...listeners}
		>
			<div className="flex flex-col items-center gap-1 shrink-0">
				<div
					className={cn(
						'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
						isCorrectPosition && 'bg-emerald-500/20 text-emerald-400',
						isWrongPosition && 'bg-red-500/20 text-red-400',
						!isChecked && 'bg-muted text-muted-foreground'
					)}
				>
					{index + 1}
				</div>
				<div className="w-px h-3 bg-border/30" />
			</div>

			<div className="flex-1 min-w-0">
				{event.year && (
					<span className="text-[10px] font-mono font-medium text-muted-foreground mb-0.5 block">
						{event.year}
					</span>
				)}
				<p
					className={cn(
						'text-sm font-medium leading-snug',
						isChecked && isCorrectPosition && 'text-emerald-400',
						isChecked && isWrongPosition && 'text-red-400',
						!isChecked && 'text-foreground'
					)}
				>
					{event.text}
				</p>
				{event.description && (
					<p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2">
						{event.description}
					</p>
				)}
			</div>

			{!isChecked && (
				<div className="shrink-0 text-muted-foreground/30">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M3 6L8 11L13 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			)}
		</m.div>
	);
}

export function TimelineSorter({ events, correctOrder, isChecked, onChange }: TimelineSorterProps) {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const oldIndex = events.findIndex((e) => e.id === active.id);
			const newIndex = events.findIndex((e) => e.id === over.id);

			if (oldIndex === -1 || newIndex === -1) return;

			const newEvents = [...events];
			const [moved] = newEvents.splice(oldIndex, 1);
			newEvents.splice(newIndex, 0, moved);

			onChange(newEvents.map((e) => e.id));
		},
		[events, onChange]
	);

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
				<div className="relative pl-4">
					<div className="absolute left-[1.35rem] top-6 bottom-6 w-px bg-border/30" />
					<div className="space-y-2">
						<AnimatePresence>
							{events.map((event, index) => (
								<SortableItem
									key={event.id}
									event={event}
									index={index}
									isChecked={isChecked}
									correctOrder={correctOrder}
								/>
							))}
						</AnimatePresence>
					</div>
				</div>
			</SortableContext>
		</DndContext>
	);
}
