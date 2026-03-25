import { type NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { getGlobalProgress, getStudyStats, getWeakTopics } from '@/services/progressService';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized', success: false }, { status: 401 });
		}

		const userId = session.user.id;

		const [globalProgress, studyStats, weakTopics] = await Promise.all([
			getGlobalProgress(userId),
			getStudyStats(userId),
			getWeakTopics(userId, 10),
		]);

		const hasRealData =
			(globalProgress && globalProgress.totalQuestionsAttempted > 0) ||
			(studyStats && studyStats.totalStudyTimeMinutes > 0);

		return NextResponse.json({
			success: true,
			hasRealData: !!hasRealData,
			globalProgress,
			studyStats,
			weakTopics,
		});
	} catch (error) {
		return handleApiError(error);
	}
}
