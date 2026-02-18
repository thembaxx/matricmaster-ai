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
		const { voteType } = body;

		if (!voteType || !['up', 'down'].includes(voteType)) {
			return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
		}

		// In production, update vote in database
		// For now, return success
		return NextResponse.json({ success: true, commentId: id, voteType });
	} catch (error) {
		console.error('Error voting on comment:', error);
		return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
	}
}
