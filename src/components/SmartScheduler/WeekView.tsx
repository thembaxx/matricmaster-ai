'use client';

import { ChevronLeft, ChevronRight } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { addDays, addWeeks, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { StudyBlockCard } from './StudyBlockCard';

export function WeekView() {
	const { currentWeek, blocks, setSelectedDate, selectedDate, setViewMode, setCurrentWeek } =
		useSmartSchedulerStore();

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

	return (
		<div className="bg-card rounded-xl border overflow-hidden">
			<div className="flex items-center justify-between p-4 border-b">
				<button
					type="button"
					onClick={() => setViewMode('day')}
					className="text-sm px-3 py-1 rounded-lg bg-muted hover:bg-muted/80"
				>
					Day View
				</button>
				<div className="flex items-center gap-2">
					<button type="button" onClick={goToPrevWeek} className="p-1 hover:bg-muted rounded-lg">
						<HugeiconsIcon icon={ChevronLeft} className="w-5 h-5" />
					</button>
					<span className="font-medium min-w-[180px] text-center">
						{format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
					</span>
					<button type="button" onClick={goToNextWeek} className="p-1 hover:bg-muted rounded-lg">
						<HugeiconsIcon icon={ChevronRight} className="w-5 h-5" />
					</button>
				</div>
				<div className="w-20" />
			</div>

			<div className="grid grid-cols-7 min-h-[300px]">
				{weekDays.map((day) => {
					const dayBlocks = getBlocksForDay(day);
					const isSelected = isSameDay(selectedDate, day);
					const isToday = isSameDay(day, new Date());

					return (
						<div key={day.toISOString()} className={`border-r ${isSelected ? 'bg-primary/5' : ''}`}>
							<button
								type="button"
								className="h-16 p-2 text-center cursor-pointer hover:bg-muted/50 border-b w-full"
								onClick={() => {
									setSelectedDate(day);
									setViewMode('day');
								}}
							>
								<div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
								<div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
									{format(day, 'd')}
								</div>
							</button>

							<div className="p-1 space-y-1 max-h-[280px] overflow-y-auto">
								{dayBlocks.length === 0 ? (
									<div className="text-xs text-muted-foreground text-center py-4">No sessions</div>
								) : (
									dayBlocks
										.slice(0, 4)
										.map((block) => <StudyBlockCard key={block.id} block={block} compact />)
								)}
								{dayBlocks.length > 4 && (
									<div className="text-xs text-muted-foreground text-center">
										+{dayBlocks.length - 4} more
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
