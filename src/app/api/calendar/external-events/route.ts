import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { calendarConnections } from '@/lib/db/schema';

interface ExternalEvent {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	source: string;
	isAllDay: boolean;
	location?: string;
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const db = await dbManager.getDb();
		const connection = await db.query.calendarConnections.findFirst({
			where: and(
				eq(calendarConnections.userId, session.user.id),
				eq(calendarConnections.provider, 'google')
			),
		});

		if (!connection) {
			return NextResponse.json({
				success: true,
				data: {
					connected: false,
					events: [],
				},
			});
		}

		if (!connection.syncEnabled) {
			return NextResponse.json({
				success: true,
				data: {
					connected: true,
					syncEnabled: false,
					events: [],
				},
			});
		}

		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		const now = new Date();
		const defaultEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

		const eventsStart = startDate ? new Date(startDate) : now;
		const eventsEnd = endDate ? new Date(endDate) : defaultEndDate;

		const mockEvents: ExternalEvent[] = [
			{
				id: 'mock-1',
				title: 'Math tutoring session',
				startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
				endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
				source: 'google',
				isAllDay: false,
				location: 'Online',
			},
			{
				id: 'mock-2',
				title: 'Physics exam preparation',
				startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
				endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
				source: 'google',
				isAllDay: false,
			},
		].filter((event) => event.startTime >= eventsStart && event.startTime <= eventsEnd);

		return NextResponse.json({
			success: true,
			data: {
				connected: true,
				syncEnabled: connection.syncEnabled,
				lastSyncAt: connection.lastSyncAt,
				events: mockEvents,
				note: 'Mock mode - external events would be pulled from Google Calendar in production',
			},
		});
	} catch (error) {
		console.debug('Error fetching external events:', error);
		return NextResponse.json({ error: 'Failed to fetch external events' }, { status: 500 });
	}
}
