import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { calendarConnections } from '@/lib/db/schema';

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
					provider: null,
					lastSyncAt: null,
					syncEnabled: false,
				},
			});
		}

		return NextResponse.json({
			success: true,
			data: {
				connected: true,
				provider: connection.provider,
				calendarId: connection.calendarId,
				lastSyncAt: connection.lastSyncAt,
				syncEnabled: connection.syncEnabled,
				expiresAt: connection.expiresAt,
			},
		});
	} catch (error) {
		console.debug('Error getting calendar sync status:', error);
		return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { syncEnabled } = body;

		const db = await dbManager.getDb();
		const existing = await db.query.calendarConnections.findFirst({
			where: and(
				eq(calendarConnections.userId, session.user.id),
				eq(calendarConnections.provider, 'google')
			),
		});

		if (!existing) {
			return NextResponse.json({ error: 'No calendar connection found' }, { status: 404 });
		}

		await db
			.update(calendarConnections)
			.set({
				syncEnabled: syncEnabled ?? existing.syncEnabled,
				updatedAt: new Date(),
			})
			.where(eq(calendarConnections.id, existing.id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('Error updating calendar sync status:', error);
		return NextResponse.json({ error: 'Failed to update sync status' }, { status: 500 });
	}
}
