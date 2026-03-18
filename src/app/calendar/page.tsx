'use client';

import { Add01Icon, Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AddEventDialog } from '@/components/Calendar/AddEventDialog';
import { CalendarEventSidebar } from '@/components/Calendar/CalendarEventSidebar';
import { CalendarGrid } from '@/components/Calendar/CalendarGrid';
import { CalendarHeader } from '@/components/Calendar/CalendarHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EVENT_TYPES, useCalendar } from '@/hooks/useCalendar';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export default function CalendarPage() {
	const {
		session,
		selectedDate,
		setSelectedDate,
		isLoading,
		showEventForm,
		setShowEventForm,
		newEvent,
		setNewEvent,
		year,
		month,
		startingDay,
		totalDays,
		prevMonth,
		nextMonth,
		goToToday,
		getEventsForDay,
		handleAddEvent,
		handleDeleteEvent,
		selectedDateEvents,
	} = useCalendar();

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 max-w-6xl">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 max-w-6xl">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<HugeiconsIcon icon={Calendar01Icon} className="h-8 w-8 text-primary" />
					<div>
						<h1 className="text-3xl font-bold">Calendar</h1>
						<p className="text-muted-foreground">Schedule and manage your study time</p>
					</div>
				</div>
				<Button onClick={() => setShowEventForm(true)} disabled={!session?.user}>
					<HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
					Add Event
				</Button>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card>
						<CalendarHeader
							month={month}
							year={year}
							months={MONTHS}
							prevMonth={prevMonth}
							nextMonth={nextMonth}
							goToToday={goToToday}
						/>
						<CardContent>
							<div className="grid grid-cols-7 mb-2">
								{DAYS.map((day) => (
									<div
										key={day}
										className="text-center text-sm font-medium text-muted-foreground py-2"
									>
										{day}
									</div>
								))}
							</div>

							<CalendarGrid
								year={year}
								month={month}
								startingDay={startingDay}
								totalDays={totalDays}
								selectedDate={selectedDate}
								onSelectDate={setSelectedDate}
								getEventsForDay={getEventsForDay}
							/>

							<div className="flex gap-4 mt-4 flex-wrap">
								{EVENT_TYPES.map((type) => (
									<div key={type.value} className="flex items-center gap-2">
										<div className={`w-3 h-3 rounded-full ${type.color.split(' ')[0]}`} />
										<span className="text-xs">{type.label}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				<div>
					<CalendarEventSidebar
						selectedDate={selectedDate}
						selectedDateEvents={selectedDateEvents}
						onDeleteEvent={handleDeleteEvent}
					/>
				</div>
			</div>

			<AddEventDialog
				showEventForm={showEventForm}
				setShowEventForm={setShowEventForm}
				newEvent={newEvent}
				setNewEvent={setNewEvent}
				onAddEvent={handleAddEvent}
			/>
		</div>
	);
}
