import { endOfWeek, startOfWeek } from 'date-fns';
import { and, eq, gte, lte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { calendarEvents } from '@/lib/db/schema';
import { getExamCountdowns } from '@/services/scheduleAIService';

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

		await dbManager.initialize();
		const db = dbManager.getDb();
		const events = await db.query.calendarEvents.findMany({
			where: and(
				eq(calendarEvents.userId, session.user.id),
				gte(calendarEvents.startTime, weekStart),
				lte(calendarEvents.endTime, weekEnd)
			),
			orderBy: [calendarEvents.startTime],
		});

		const blocks = events.map((e) => ({
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

		await dbManager.initialize();
		const db = dbManager.getDb();

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

		return NextResponse.json({ success: true, block: event });
	} catch (error) {
		console.error('Error creating block:', error);
		return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
	}
}
