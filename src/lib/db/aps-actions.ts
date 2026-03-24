import { desc, eq } from 'drizzle-orm';
import { dbManager, getDb } from './index';
import { type UserApsScore, userApsScores } from './schema';

const GRADE_POINTS: Record<string, number> = {
	'7': 7,
	'6': 6,
	'5': 5,
	'4': 4,
	'3': 3,
	'2': 2,
	'1': 1,
	U: 0,
};

export async function getUserApsScores(userId: string): Promise<UserApsScore[]> {
	const connected = await dbManager.waitForConnection();
	if (!connected) throw new Error('Database connection failed');

	const db = await getDb();
	return db
		.select()
		.from(userApsScores)
		.where(eq(userApsScores.userId, userId))
		.orderBy(desc(userApsScores.apsPoints));
}

export async function getUserTotalAps(userId: string): Promise<number> {
	const scores = await getUserApsScores(userId);
	if (scores.length === 0) return 0;

	const sortedScores = scores
		.filter((s) => s.subject !== 'Life Orientation')
		.sort((a, b) => b.apsPoints - a.apsPoints)
		.slice(0, 6);

	const lifeOrientation = scores.find((s) => s.subject === 'Life Orientation');
	const subjects = lifeOrientation ? [...sortedScores, lifeOrientation] : sortedScores;

	return subjects.slice(0, 7).reduce((sum, s) => sum + s.apsPoints, 0);
}

export async function upsertApsScore(
	userId: string,
	subject: string,
	grade: string,
	assessmentType: 'quiz' | 'pastPaper' | 'reportCard',
	assessmentScore?: number
): Promise<UserApsScore> {
	const connected = await dbManager.waitForConnection();
	if (!connected) throw new Error('Database connection failed');

	const db = await getDb();
	const points = GRADE_POINTS[grade] ?? 0;

	const [score] = await db
		.insert(userApsScores)
		.values({
			userId,
			subject,
			currentGrade: grade,
			apsPoints: points,
			lastAssessmentType: assessmentType,
			lastAssessmentScore: assessmentScore ?? null,
		})
		.onConflictDoUpdate({
			target: [userApsScores.userId, userApsScores.subject],
			set: {
				currentGrade: grade,
				apsPoints: points,
				lastAssessmentType: assessmentType,
				lastAssessmentScore: assessmentScore ?? null,
				lastUpdatedAt: new Date(),
			},
		})
		.returning();

	return score;
}

export async function initializeUserApsFromReportCard(
	userId: string,
	subjects: Array<{ subject: string; grade: string }>
): Promise<void> {
	for (const { subject, grade } of subjects) {
		await upsertApsScore(userId, subject, grade, 'reportCard');
	}
}

export { GRADE_POINTS };
