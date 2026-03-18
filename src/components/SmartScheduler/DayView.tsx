'use client';

import { ChevronLeft, ChevronRight } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { addDays, format, isSameDay } from 'date-fns';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { StudyBlockCard } from './StudyBlockCard';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

export function DayView() {
	const { selectedDate, setSelectedDate, blocks } = useSmartSchedulerStore();

	const dayBlocks = blocks.filter((b) => isSameDay(new Date(b.date), selectedDate));

	const goToPrevDay = () => setSelectedDate(addDays(selectedDate, -1));
	const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));

	const getBlocksForHour = (hour: number) => {
		return dayBlocks.filter((b) => {
			const blockHour = Number.parseInt(b.startTime.split(':')[0], 10);
			return blockHour === hour;
		});
	};

	return (
		<div className="bg-card rounded-xl border overflow-hidden">
			<div className="flex items-center justify-between p-4 border-b">
				<button type="button" onClick={goToPrevDay} className="p-2 hover:bg-muted rounded-lg">
					<HugeiconsIcon icon={ChevronLeft} className="w-5 h-5" />
				</button>
				<div className="text-center">
					<div className="font-semibold">{format(selectedDate, 'EEEE')}</div>
					<div className="text-sm text-muted-foreground">
						{format(selectedDate, 'MMMM d, yyyy')}
					</div>
				</div>
				<button type="button" onClick={goToNextDay} className="p-2 hover:bg-muted rounded-lg">
					<HugeiconsIcon icon={ChevronRight} className="w-5 h-5" />
				</button>
			</div>

			<div className="max-h-[500px] overflow-y-auto">
				{HOURS.map((hour) => {
					const hourBlocks = getBlocksForHour(hour);

					return (
						<div key={hour} className="flex border-b min-h-[80px]">
							<div className="w-16 p-2 text-xs text-muted-foreground border-r flex-shrink-0">
								{hour}:00
							</div>
							<div className="flex-1 p-2 space-y-2">
								{hourBlocks.map((block) => (
									<StudyBlockCard key={block.id} block={block} />
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
