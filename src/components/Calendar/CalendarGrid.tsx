'use client';

import type { CalendarEvent } from '@/hooks/useCalendar';
import { EVENT_TYPES } from '@/hooks/useCalendar';

interface CalendarGridProps {
	year: number;
	month: number;
	startingDay: number;
	totalDays: number;
	selectedDate: Date | null;
	onSelectDate: (date: Date) => void;
	getEventsForDay: (day: number) => CalendarEvent[];
}

export function CalendarGrid({
	year,
	month,
	startingDay,
	totalDays,
	selectedDate,
	onSelectDate,
	getEventsForDay,
}: CalendarGridProps) {
	const days = [];

	for (let i = 0; i < startingDay; i++) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		days.push(<div key={`empty-${i}`} className="h-24 border bg-muted/30" />);
	}

	for (let day = 1; day <= totalDays; day++) {
		const date = new Date(year, month, day);
		const isToday = date.toDateString() === new Date().toDateString();
		const isSelected = selectedDate?.toDateString() === date.toDateString();
		const dayEvents = getEventsForDay(day);

		days.push(
			<button
				type="button"
				key={day}
				onClick={() => onSelectDate(date)}
				className={`h-24 border p-1 cursor-pointer hover:bg-accent transition-colors text-left ${
					isToday ? 'bg-blue-50' : ''
				} ${isSelected ? 'ring-2 ring-primary' : ''}`}
			>
				<div
					className={`text-sm font-medium mb-1 ${
						isToday
							? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
							: ''
					}`}
				>
					{day}
				</div>
				<div className="space-y-1 overflow-hidden">
					{dayEvents.slice(0, 2).map((event) => (
						<div
							key={event.id}
							className={`text-xs px-1 py-0.5 rounded truncate ${
								EVENT_TYPES.find((t) => t.value === event.eventType)?.color || 'bg-muted'
							}`}
						>
							{event.title}
						</div>
					))}
					{dayEvents.length > 2 && (
						<div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
					)}
				</div>
			</button>
		);
	}

	return <div className="grid grid-cols-7 border">{days}</div>;
}
