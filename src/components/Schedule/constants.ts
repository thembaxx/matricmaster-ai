import type { CalendarEvent } from '@/lib/db/schema';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

export interface UIEvent {
	id: string;
	day: string;
	start: number;
	end: number;
	title: string;
	subject: string;
	color: string;
	startTime: Date;
	endTime: Date;
	eventType: string;
	subjectId?: number;
	subjectName?: string;
	isCompleted: boolean;
}

export interface CalendarEventWithSubject extends CalendarEvent {
	subjectName: string | null;
}

export const mapDbEventToUI = (e: CalendarEventWithSubject): UIEvent => {
	const start = new Date(e.startTime);
	const end = new Date(e.endTime);
	const dayName = DAYS[start.getDay() === 0 ? 6 : start.getDay() - 1];
	return {
		id: e.id,
		day: dayName,
		start: start.getHours() + start.getMinutes() / 60,
		end: end.getHours() + end.getMinutes() / 60,
		title: e.title,
		subject: e.subjectName || 'Study',
		color: e.isCompleted ? 'bg-green-500' : 'bg-primary',
		startTime: start,
		endTime: end,
		eventType: e.eventType,
		subjectId: e.subjectId ?? undefined,
		subjectName: e.subjectName || undefined,
		isCompleted: e.isCompleted,
	};
};

export function getCurrentDayName(): string {
	const today = new Date();
	const dayIndex = today.getDay();
	return DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
}
