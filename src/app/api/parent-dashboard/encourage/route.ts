import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { notifications } from '@/lib/db/schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return (await dbManager.getDb()) as DbType;
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const headersList = request.headers;
		const session = await auth.api.getSession({ headers: headersList as never });

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { message, studentName } = body;

		if (!message || typeof message !== 'string') {
			return NextResponse.json({ error: 'Message is required' }, { status: 400 });
		}

		const db = await getDb();

		await db.insert(notifications).values({
			userId: session.user.id,
			type: 'encouragement',
			title: 'Message from Parent',
			message: message.trim(),
			data: JSON.stringify({
				from: 'parent',
				studentName: studentName || 'Student',
			}),
			isRead: false,
			createdAt: new Date(),
		});

		return NextResponse.json({
			success: true,
			message: 'Encouragement sent successfully',
		});
	} catch (error) {
		console.error('Error sending encouragement:', error);
		return NextResponse.json({ error: 'Failed to send encouragement' }, { status: 500 });
	}
}
