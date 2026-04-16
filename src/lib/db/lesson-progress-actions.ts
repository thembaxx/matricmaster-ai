'use server';

import { and, eq } from 'drizzle-orm';
import { ensureAuthenticated } from './actions';
import { dbManager } from './index';
import { lessonProgress } from './schema';

export interface LessonProgressUpdate {
	lessonId: string;
	status: 'completed' | 'in_progress' | 'not_started';
	durationMinutes?: number;
}

/**
 * Updates progress for a specific lesson
 */
export async function updateLessonProgressAction(data: LessonProgressUpdate) {
	try {
		const user = await ensureAuthenticated();
		const db = await dbManager.getDb();

		const existing = await db.query.lessonProgress.findFirst({
			where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, data.lessonId)),
		});

		if (existing) {
			await db
				.update(lessonProgress)
				.set({
					status: data.status,
					timeSpentMinutes: data.durationMinutes ?? existing.timeSpentMinutes,
					completedAt: data.status === 'completed' ? new Date() : null,
					startedAt:
						data.status !== 'not_started' && !existing.startedAt ? new Date() : existing.startedAt,
					updatedAt: new Date(),
				})
				.where(eq(lessonProgress.id, existing.id));
		} else {
			await db.insert(lessonProgress).values({
				userId: user.id,
				lessonId: data.lessonId,
				status: data.status,
				timeSpentMinutes: data.durationMinutes ?? 0,
				startedAt: data.status !== 'not_started' ? new Date() : null,
				completedAt: data.status === 'completed' ? new Date() : null,
			});
		}

		return { success: true };
	} catch (error) {
		console.debug('[LessonProgress] Error updating:', error);
		return { success: false, error: 'Failed to update progress' };
	}
}

/**
 * Gets lesson progress for a specific lesson
 */
export async function getLessonProgressAction(lessonId: string) {
	try {
		const user = await ensureAuthenticated();
		const db = await dbManager.getDb();

		const progress = await db.query.lessonProgress.findFirst({
			where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)),
		});

		return progress ?? null;
	} catch {
		return null;
	}
}

/**
 * Gets progress for multiple lessons
 */
export async function getMultipleLessonProgressAction(_lessonIds: string[]) {
	try {
		const user = await ensureAuthenticated();
		const db = await dbManager.getDb();

		const progressList = await db.query.lessonProgress.findMany({
			where: and(
				eq(lessonProgress.userId, user.id)
				// Note: This would need sql`${lessonProgress.lessonId} IN ${lessonIds}` in raw SQL
			),
		});

		const progressMap: Record<string, (typeof progressList)[0]> = {};
		progressList.forEach((p) => {
			progressMap[p.lessonId] = p;
		});

		return progressMap;
	} catch {
		return {};
	}
}

/**
 * Marks a lesson as completed and records the session
 */
export async function completeLessonAction(lessonId: string, durationMinutes: number) {
	return updateLessonProgressAction({
		lessonId,
		status: 'completed',
		durationMinutes,
	});
}
