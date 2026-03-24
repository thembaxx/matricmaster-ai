import { endOfWeek, startOfWeek } from 'date-fns';
import { and, eq, gte, lte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { calendarEvents } from '@/lib/db/schema';
import { getExamCountdowns } from '@/services/scheduleAIService';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return dbManager.getDb() as DbType;
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const weekStr = searchParams.get('week');

		let targetDate = new Date();
		if (weekStr) {
			const parts = weekStr.split('-W');
			if (parts.length === 2) {
				const [year, week] = parts.map(Number);
				if (year && week) {
					const simple = new Date(year, 0, 1 + (week - 1) * 7);
					targetDate = startOfWeek(simple, { weekStartsOn: 1 });
				}
			}
		}

		const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
		const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

		const db = await getDb();
		const events = await db
			.select()
			.from(calendarEvents)
			.where(
				and(
					eq(calendarEvents.userId, session.user.id),
					gte(calendarEvents.startTime, weekStart),
					lte(calendarEvents.endTime, weekEnd)
				)
			)
			.orderBy(calendarEvents.startTime);

		const blocks = events.map((e: (typeof events)[number]) => ({
			id: e.id,
			subject: e.title.split(':')[0] || 'General',
			topic: e.title.includes(':') ? e.title.split(':')[1]?.trim() : undefined,
			date: e.startTime,
			startTime: `${e.startTime.getHours().toString().padStart(2, '0')}:${e.startTime.getMinutes().toString().padStart(2, '0')}`,
			endTime: `${e.endTime.getHours().toString().padStart(2, '0')}:${e.endTime.getMinutes().toString().padStart(2, '0')}`,
			duration: Math.round((e.endTime.getTime() - e.startTime.getTime()) / 60000),
			type: e.eventType as 'study' | 'review' | 'practice' | 'break',
			isCompleted: e.isCompleted,
			isAISuggested: false,
			calendarEventId: e.id,
		}));

		const exams = await getExamCountdowns();

		return NextResponse.json({ blocks, exams });
	} catch (error) {
		console.error('Error fetching blocks:', error);
		return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();

		const db = await getDb();

		const [startH, startM] = (body.startTime || '09:00').split(':').map(Number);
		const duration = body.duration || 60;
		const startDate = new Date(body.date);
		startDate.setHours(startH, startM, 0, 0);

		const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

		const [event] = await db
			.insert(calendarEvents)
			.values({
				userId: session.user.id,
				title: body.subject + (body.topic ? `: ${body.topic}` : ''),
				description: body.topic || '',
				startTime: startDate,
				endTime: endDate,
				eventType: body.type || 'study',
				isCompleted: body.isCompleted || false,
			})
			.returning();

		return NextResponse.json({
			success: true,
			block: {
				id: event.id,
				subject: event.title.split(':')[0] || 'General',
				topic: event.title.includes(':') ? event.title.split(':')[1]?.trim() : undefined,
				date: event.startTime,
				startTime: `${event.startTime.getHours().toString().padStart(2, '0')}:${event.startTime.getMinutes().toString().padStart(2, '0')}`,
				endTime: `${event.endTime.getHours().toString().padStart(2, '0')}:${event.endTime.getMinutes().toString().padStart(2, '0')}`,
				duration,
				type: event.eventType,
				isCompleted: event.isCompleted,
				isAISuggested: false,
				calendarEventId: event.id,
			},
		});
	} catch (error) {
		console.error('Error creating block:', error);
		return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { id, isCompleted, date, startTime, duration, subject, topic, type } = body;

		if (!id) {
			return NextResponse.json({ error: 'Block ID is required' }, { status: 400 });
		}

		const db = await getDb();

		const existing = await db
			.select()
			.from(calendarEvents)
			.where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, session.user.id)))
			.limit(1)
			.then((rows) => rows[0]);

		if (!existing) {
			return NextResponse.json({ error: 'Block not found' }, { status: 404 });
		}

		const updateData: Record<string, unknown> = { updatedAt: new Date() };

		if (typeof isCompleted === 'boolean') {
			updateData.isCompleted = isCompleted;
		}

		if (date || startTime || duration) {
			const baseDate = date ? new Date(date) : existing.startTime;
			const [sh, sm] = (startTime || '09:00').split(':').map(Number);
			baseDate.setHours(sh, sm, 0, 0);
			updateData.startTime = baseDate;

			const dur =
				duration || Math.round((existing.endTime.getTime() - existing.startTime.getTime()) / 60000);
			updateData.endTime = new Date(baseDate.getTime() + dur * 60 * 1000);
		}

		if (subject) {
			updateData.title = subject + (topic ? `: ${topic}` : '');
		}

		if (topic) {
			updateData.description = topic;
		}

		if (type) {
			updateData.eventType = type;
		}

		await db.update(calendarEvents).set(updateData).where(eq(calendarEvents.id, id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating block:', error);
		return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ error: 'Block ID is required' }, { status: 400 });
		}

		const db = await getDb();

		const existing = await db
			.select()
			.from(calendarEvents)
			.where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, session.user.id)))
			.limit(1)
			.then((rows) => rows[0]);

		if (!existing) {
			return NextResponse.json({ error: 'Block not found' }, { status: 404 });
		}

		await db.delete(calendarEvents).where(eq(calendarEvents.id, id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting block:', error);
		return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
	}
}
