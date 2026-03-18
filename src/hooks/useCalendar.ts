'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/api/endpoints';
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
	const queryClient = useQueryClient();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

	const fetchEvents = useCallback(async () => {
		if (!session?.user?.id) {
			return [];
		}

		const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		const url = new URL(API_ENDPOINTS.calendarEvents, window.location.origin);
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
			return mappedEvents;
		}
		return [];
	}, [session?.user?.id, currentDate]);

	const { data: events = [], isLoading } = useQuery({
		queryKey: [QUERY_KEYS.calendarEvents, currentDate.getFullYear(), currentDate.getMonth()],
		queryFn: fetchEvents,
		enabled: !!session?.user?.id,
		staleTime: 60 * 1000,
	});

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

	const addEventMutation = useMutation({
		mutationFn: async (data: {
			title: string;
			description: string;
			startTime: string;
			endTime: string;
			eventType: EventType;
		}) => {
			const response = await fetch(API_ENDPOINTS.calendarEvents, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			return response.json();
		},
		onSuccess: (result) => {
			if (result.success) {
				queryClient.invalidateQueries({
					queryKey: [QUERY_KEYS.calendarEvents, currentDate.getFullYear(), currentDate.getMonth()],
				});
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
		},
		onError: () => {
			toast.error('Failed to create event');
		},
	});

	const deleteEventMutation = useMutation({
		mutationFn: async (eventId: string) => {
			const url = new URL(API_ENDPOINTS.calendarEvents, window.location.origin);
			url.searchParams.set('id', eventId);

			const response = await fetch(url.toString(), {
				method: 'DELETE',
			});
			return response.json();
		},
		onSuccess: (result) => {
			if (result.success) {
				queryClient.invalidateQueries({
					queryKey: [QUERY_KEYS.calendarEvents, currentDate.getFullYear(), currentDate.getMonth()],
				});
				toast.success('Event deleted successfully');
			} else {
				toast.error(result.error || 'Failed to delete event');
			}
		},
		onError: () => {
			toast.error('Failed to delete event');
		},
	});

	const handleAddEvent = async () => {
		if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return;

		if (!session?.user?.id) {
			toast.error('Please sign in to create events');
			return;
		}

		addEventMutation.mutate({
			title: newEvent.title,
			description: newEvent.description,
			startTime: newEvent.startTime,
			endTime: newEvent.endTime,
			eventType: newEvent.eventType,
		});
	};

	const handleDeleteEvent = async (eventId: string) => {
		if (!session?.user?.id) {
			toast.error('Please sign in to delete events');
			return;
		}

		deleteEventMutation.mutate(eventId);
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
