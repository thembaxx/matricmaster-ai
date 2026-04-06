import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { calendarConnections, syncedEvents } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
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
			return NextResponse.json({ error: 'No calendar connection found' }, { status: 404 });
		}

		await db
			.update(calendarConnections)
			.set({
				accessTokenEncrypted: null,
				refreshTokenEncrypted: null,
				expiresAt: null,
				calendarId: null,
				lastSyncAt: null,
				syncEnabled: false,
				updatedAt: new Date(),
			})
			.where(eq(calendarConnections.id, connection.id));

		await db.delete(syncedEvents).where(eq(syncedEvents.userId, session.user.id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('Error disconnecting calendar:', error);
		return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 });
	}
}
