import { type NextRequest, NextResponse } from 'next/server';
import { ACHIEVEMENTS } from '@/content';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { getUserAchievements } from '@/lib/db/achievement-actions';
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

		const [globalProgress, studyStats, weakTopics, userAchievementsData] = await Promise.all([
			getGlobalProgress(userId),
			getStudyStats(userId),
			getWeakTopics(userId, 10),
			getUserAchievements(),
		]);

		const hasRealData =
			(globalProgress && globalProgress.totalQuestionsAttempted > 0) ||
			(studyStats && studyStats.totalStudyTimeMinutes > 0);

		// Transform achievements to match the Analytics Achievement interface
		const unlockedIds = new Set(userAchievementsData.unlocked.map((a) => a.achievementId));
		const achievements = ACHIEVEMENTS.map((a) => {
			const unlocked = userAchievementsData.unlocked.find((u) => u.achievementId === a.id);
			return {
				id: a.id,
				name: a.name,
				description: a.description,
				icon: a.icon,
				unlockedAt: unlocked?.unlockedAt || null,
				progress: unlockedIds.has(a.id) ? 100 : 0,
			};
		});

		return NextResponse.json({
			success: true,
			hasRealData: !!hasRealData,
			globalProgress,
			studyStats,
			weakTopics,
			achievements,
		});
	} catch (error) {
		return handleApiError(error);
	}
}
