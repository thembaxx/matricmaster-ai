'use client';

import { ChevronLeft, ChevronRight } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { addDays, addWeeks, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDragStore } from '@/stores/useDragStore';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { StudyBlockCard } from './StudyBlockCard';

export function WeekView() {
	const {
		currentWeek,
		blocks,
		setSelectedDate,
		selectedDate,
		setViewMode,
		setCurrentWeek,
		moveBlock,
	} = useSmartSchedulerStore();
	const { isDragging, endDrag } = useDragStore();
	const [dragOverDay, setDragOverDay] = useState<Date | null>(null);

	const weekDays = Array.from({ length: 7 }, (_, i) =>
		addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i)
	);

	const getBlocksForDay = (day: Date) => {
		return blocks
			.filter((b) => isSameDay(new Date(b.date), day))
			.sort((a, b) => a.startTime.localeCompare(b.startTime));
	};

	const goToPrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
	const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

	const handleDragOver = (e: React.DragEvent, day: Date) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		setDragOverDay(day);
	};

	const handleDragLeave = () => {
		setDragOverDay(null);
	};

	const handleDrop = (e: React.DragEvent, day: Date) => {
		e.preventDefault();
		const blockId = e.dataTransfer.getData('blockId');
		if (blockId) {
			moveBlock(blockId, day);
		}
		setDragOverDay(null);
		endDrag();
	};

	return (
		<div className="bg-card rounded-xl border overflow-hidden shadow-sm">
			<div className="flex items-center justify-between p-4 border-b bg-muted/30">
				<button
					type="button"
					onClick={() => setViewMode('day')}
					className="text-sm px-3 py-1.5 rounded-lg bg-background hover:bg-muted transition-colors border"
				>
					Day View
				</button>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={goToPrevWeek}
						className="p-1.5 hover:bg-muted rounded-lg transition-colors"
					>
						<HugeiconsIcon icon={ChevronLeft} className="w-5 h-5" />
					</button>
					<span className="font-medium min-w-[140px] sm:min-w-[180px] text-center text-sm">
						{format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
					</span>
					<button
						type="button"
						onClick={goToNextWeek}
						className="p-1.5 hover:bg-muted rounded-lg transition-colors"
					>
						<HugeiconsIcon icon={ChevronRight} className="w-5 h-5" />
					</button>
				</div>
				<div className="w-20" />
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 min-h-[320px]">
				{weekDays.map((day) => {
					const dayBlocks = getBlocksForDay(day);
					const isSelected = isSameDay(selectedDate, day);
					const isToday = isSameDay(day, new Date());
					const isDragOver = isDragging && dragOverDay && isSameDay(dragOverDay, day);

					return (
						<div
							key={day.toISOString()}
							className={cn(
								'border-r last:border-r-0 transition-colors duration-200',
								isSelected && 'ring-1 ring-inset ring-primary/20',
								isDragOver && 'bg-primary/5'
							)}
							onDragOver={(e) => handleDragOver(e, day)}
							onDragLeave={handleDragLeave}
							onDrop={(e) => handleDrop(e, day)}
							role="list"
						>
							<button
								type="button"
								className={cn(
									'h-16 p-2 text-center hover:bg-muted/50 border-b w-full transition-colors',
									isToday && 'bg-primary/5'
								)}
								onClick={() => {
									setSelectedDate(day);
									setViewMode('day');
								}}
							>
								<div className="text-xs text-muted-foreground font-medium">
									{format(day, 'EEE')}
								</div>
								<div
									className={cn(
										'text-lg font-semibold transition-colors',
										isToday ? 'text-primary' : 'text-foreground'
									)}
								>
									{format(day, 'd')}
								</div>
							</button>

							<div className="p-1.5 space-y-1 max-h-[260px] overflow-y-auto">
								{dayBlocks.length === 0 ? (
									isDragOver ? (
										<div className="text-xs text-primary font-medium text-center py-4 border-2 border-dashed border-primary/30 rounded-lg mx-0.5">
											Drop here
										</div>
									) : (
										<div className="text-xs text-muted-foreground/60 text-center py-4">—</div>
									)
								) : (
									dayBlocks
										.slice(0, 4)
										.map((block) => <StudyBlockCard key={block.id} block={block} compact />)
								)}
								{dayBlocks.length > 4 && (
									<div className="text-xs text-muted-foreground text-center font-medium py-1">
										+{dayBlocks.length - 4} more
									</div>
								)}
								{isDragOver && dayBlocks.length > 0 && (
									<div className="text-xs text-primary font-medium text-center py-2 border-2 border-dashed border-primary/30 rounded">
										Drop here
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
