import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const auth = getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const { reason } = body;

		if (!reason) {
			return NextResponse.json({ error: 'Flag reason required' }, { status: 400 });
		}

		// In production, create flag record in database
		return NextResponse.json({
			success: true,
			commentId: id,
			reason,
			reporterId: session.user.id,
		});
	} catch (error) {
		console.error('Error flagging comment:', error);
		return NextResponse.json({ error: 'Failed to flag comment' }, { status: 500 });
	}
}
