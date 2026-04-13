import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { markAsRead } from '@/lib/db/notification-actions';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const result = await markAsRead(id, session.user.id);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to mark as read' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, notificationId: id });
	} catch (error) {
		console.debug('Error marking notification as read:', error);
		return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
	}
}
