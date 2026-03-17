import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	createNotification,
	deleteAllNotifications,
	getNotifications,
	getUnreadCount,
	markAllAsRead,
} from '@/lib/db/notification-actions';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const unreadOnly = searchParams.get('unreadOnly') === 'true';
		const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
		const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

		// Get unread count
		const unreadCount = await getUnreadCount(session.user.id);

		// Get notifications
		const notifications = await getNotifications(session.user.id, {
			unreadOnly,
			limit,
			offset,
		});

		return NextResponse.json({
			success: true,
			data: notifications,
			unreadCount,
		});
	} catch (error) {
		console.debug('Error fetching notifications:', error);
		return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
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
		const { type, title, message, data } = body;

		if (!type || !title || !message) {
			return NextResponse.json(
				{ error: 'Missing required fields: type, title, message' },
				{ status: 400 }
			);
		}

		const result = await createNotification(session.user.id, {
			type,
			title,
			message,
			data,
		});

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to create notification' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.notification }, { status: 201 });
	} catch (error) {
		console.debug('Error creating notification:', error);
		return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const result = await markAllAsRead(session.user.id);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to mark all as read' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('Error marking all as read:', error);
		return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const result = await deleteAllNotifications(session.user.id);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to delete notifications' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('Error deleting notifications:', error);
		return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
	}
}
