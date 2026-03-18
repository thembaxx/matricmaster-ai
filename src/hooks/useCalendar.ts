'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';

export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	eventType: 'exam' | 'study' | 'lesson' | 'reminder' | 'personal';
	subject?: string;
	isCompleted?: boolean;
}

export type EventType = 'exam' | 'study' | 'lesson' | 'reminder' | 'personal';

export const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
	{ value: 'exam', label: 'Exam', color: 'bg-red-100 text-red-800' },
	{ value: 'study', label: 'Study Session', color: 'bg-blue-100 text-blue-800' },
	{ value: 'lesson', label: 'Lesson', color: 'bg-green-100 text-green-800' },
	{ value: 'reminder', label: 'Reminder', color: 'bg-yellow-100 text-yellow-800' },
	{ value: 'personal', label: 'Personal', color: 'bg-purple-100 text-purple-800' },
];

export function useCalendar() {
	const { data: session } = useSession();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showEventForm, setShowEventForm] = useState(false);
	const [newEvent, setNewEvent] = useState<{
		title: string;
		description: string;
		startTime: string;
		endTime: string;
		eventType: EventType;
		subject: string;
		reminder: string;
	}>({
		title: '',
		description: '',
		startTime: '',
		endTime: '',
		eventType: 'study',
		subject: '',
		reminder: '30',
	});

	const loadEvents = useCallback(async () => {
		if (!session?.user?.id) {
			setIsLoading(false);
			return;
		}

		try {
			const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
			const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

			const url = new URL('/api/calendar/events', window.location.origin);
			url.searchParams.set('startDate', startDate.toISOString());
			url.searchParams.set('endDate', endDate.toISOString());

			const response = await fetch(url.toString());
			const result = await response.json();

			if (result.success && result.data) {
				const mappedEvents: CalendarEvent[] = result.data.map(
					(event: {
						id: string;
						title: string;
						description?: string;
						startTime: Date;
						endTime: Date;
						eventType: string;
						subject?: string;
					}) => ({
						id: event.id,
						title: event.title,
						description: event.description,
						startTime: new Date(event.startTime),
						endTime: new Date(event.endTime),
						eventType: event.eventType as CalendarEvent['eventType'],
						subject: event.subject,
					})
				);
				setEvents(mappedEvents);
			}
		} catch (error) {
			console.debug('Error loading events:', error);
		} finally {
			setIsLoading(false);
		}
	}, [session?.user?.id, currentDate]);

	useEffect(() => {
		loadEvents();
	}, [loadEvents]);

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const firstDayOfMonth = new Date(year, month, 1);
	const lastDayOfMonth = new Date(year, month + 1, 0);
	const startingDay = firstDayOfMonth.getDay();
	const totalDays = lastDayOfMonth.getDate();

	const prevMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
	};

	const nextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	const getEventsForDay = (day: number) => {
		return events.filter((event) => {
			const eventDate = new Date(event.startTime);
			return (
				eventDate.getDate() === day &&
				eventDate.getMonth() === month &&
				eventDate.getFullYear() === year
			);
		});
	};

	const handleAddEvent = async () => {
		if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return;

		if (!session?.user?.id) {
			toast.error('Please sign in to create events');
			return;
		}

		try {
			const response = await fetch('/api/calendar/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: newEvent.title,
					description: newEvent.description,
					startTime: newEvent.startTime,
					endTime: newEvent.endTime,
					eventType: newEvent.eventType,
				}),
			});

			const result = await response.json();

			if (result.success) {
				const createdEvent: CalendarEvent = {
					id: result.data.id,
					title: result.data.title,
					description: result.data.description,
					startTime: new Date(result.data.startTime),
					endTime: new Date(result.data.endTime),
					eventType: result.data.eventType,
					subject: result.data.subject,
				};
				setEvents([...events, createdEvent]);
				toast.success('Event created successfully');
				setShowEventForm(false);
				setNewEvent({
					title: '',
					description: '',
					startTime: '',
					endTime: '',
					eventType: 'study',
					subject: '',
					reminder: '30',
				});
			} else {
				toast.error(result.error || 'Failed to create event');
			}
		} catch (error) {
			console.debug('Error creating event:', error);
			toast.error('Failed to create event');
		}
	};

	const handleDeleteEvent = async (eventId: string) => {
		if (!session?.user?.id) {
			toast.error('Please sign in to delete events');
			return;
		}

		try {
			const url = new URL('/api/calendar/events', window.location.origin);
			url.searchParams.set('id', eventId);

			const response = await fetch(url.toString(), {
				method: 'DELETE',
			});

			const result = await response.json();

			if (result.success) {
				setEvents(events.filter((e) => e.id !== eventId));
				toast.success('Event deleted successfully');
			} else {
				toast.error(result.error || 'Failed to delete event');
			}
		} catch (error) {
			console.debug('Error deleting event:', error);
			toast.error('Failed to delete event');
		}
	};

	const selectedDateEvents = selectedDate
		? events.filter((e) => new Date(e.startTime).toDateString() === selectedDate.toDateString())
		: [];

	return {
		session,
		currentDate,
		selectedDate,
		setSelectedDate,
		events,
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
	};
}
