import { type NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { getLearningStats } from '@/lib/db/adaptive-question-actions';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const stats = await getLearningStats(session.user.id);

		return NextResponse.json(stats);
	} catch (error) {
		return handleApiError(error);
	}
}
