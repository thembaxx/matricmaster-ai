import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	createCalendarEvent,
	deleteCalendarEvent,
	getCalendarEvents,
	updateCalendarEvent,
} from '@/lib/db/calendar-actions';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const eventType = searchParams.get('eventType');

		const events = await getCalendarEvents(session.user.id, {
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			eventType: eventType || undefined,
		});

		return NextResponse.json({ success: true, data: events });
	} catch (error) {
		console.error('Error fetching events:', error);
		return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const {
			title,
			description,
			startTime,
			endTime,
			eventType,
			isAllDay,
			location,
			reminderMinutes,
		} = body;

		if (!title || !startTime || !endTime) {
			return NextResponse.json(
				{ error: 'Missing required fields: title, startTime, endTime' },
				{ status: 400 }
			);
		}

		const result = await createCalendarEvent(session.user.id, {
			title,
			description,
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			eventType: eventType || 'study',
			isAllDay: isAllDay || false,
			location,
			reminderMinutes,
		});

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to create event' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.event }, { status: 201 });
	} catch (error) {
		console.error('Error creating event:', error);
		return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const eventId = searchParams.get('id');

		if (!eventId) {
			return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
		}

		const body = await request.json();
		const result = await updateCalendarEvent(eventId, session.user.id, body);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to update event' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.event });
	} catch (error) {
		console.error('Error updating event:', error);
		return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const eventId = searchParams.get('id');

		if (!eventId) {
			return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
		}

		const result = await deleteCalendarEvent(eventId, session.user.id);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to delete event' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting event:', error);
		return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
	}
}
