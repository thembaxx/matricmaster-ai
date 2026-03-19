import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getWeakTopics } from '@/services/progressService';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = Number.parseInt(searchParams.get('limit') || '5', 10);

		const topics = await getWeakTopics(session.user.id, limit);

		return NextResponse.json(topics);
	} catch (error) {
		console.error('Error in GET /api/progress/weak-topics:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
