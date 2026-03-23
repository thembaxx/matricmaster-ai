'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import {
	quizResults,
	schoolAdmins,
	schoolLicenses,
	schools,
	studySessions,
	topicMastery,
	userProgress,
	users,
} from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface SchoolAnalytics {
	schoolId: string;
	schoolName: string;
	totalLearners: number;
	averageAccuracy: number;
	mostChallengingTopics: { topic: string; averageMastery: number }[];
	strongestTopics: { topic: string; averageMastery: number }[];
	activeUsers: number;
	totalStudyMinutes: number;
}

export interface LearnerProgress {
	learnerId: string;
	learnerName: string;
	progress: number;
	accuracy: number;
	topicsMastered: number;
	weakTopics: string[];
	studyStreak: number;
}

export async function getSchoolAnalytics(schoolId: string): Promise<SchoolAnalytics> {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const school = await db.query.schools.findFirst({
		where: eq(schools.id, schoolId),
	});

	if (!school) throw new Error('School not found');

	const adminCheck = await db.query.schoolAdmins.findFirst({
		where: and(eq(schoolAdmins.schoolId, schoolId), eq(schoolAdmins.userId, session.user.id)),
	});

	if (!adminCheck) throw new Error('Not authorized for this school');

	const schoolUsers = await db.query.users.findMany({
		where: sql`${users.id} IN (
      SELECT user_id FROM ${schoolLicenses} 
      WHERE ${schoolLicenses.schoolId} = ${schoolId} 
      AND ${schoolLicenses.status} = 'active'
    )`,
	});

	const userIds = schoolUsers.map((u: typeof users.$inferSelect) => u.id);

	if (userIds.length === 0) {
		return {
			schoolId,
			schoolName: school.name,
			totalLearners: 0,
			averageAccuracy: 0,
			mostChallengingTopics: [],
			strongestTopics: [],
			activeUsers: 0,
			totalStudyMinutes: 0,
		};
	}

	const recentQuizzes = await db.query.quizResults.findMany({
		where: and(
			sql`${quizResults.userId} IN ${userIds}`,
			gte(quizResults.completedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
		),
	});

	const recentSessions = await db.query.studySessions.findMany({
		where: and(
			sql`${studySessions.userId} IN ${userIds}`,
			gte(studySessions.startedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
		),
	});

	const totalQuestions = recentQuizzes.reduce(
		(sum: number, q: typeof quizResults.$inferSelect) => sum + q.totalQuestions,
		0
	);
	const totalCorrect = recentQuizzes.reduce(
		(sum: number, q: typeof quizResults.$inferSelect) => sum + q.score,
		0
	);
	const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

	const masteries = await db.query.topicMastery.findMany({
		where: sql`${topicMastery.userId} IN ${userIds}`,
	});

	const topicStats = new Map<string, { total: number; count: number }>();
	for (const m of masteries) {
		const existing = topicStats.get(m.topic) || { total: 0, count: 0 };
		existing.total += Number(m.masteryLevel);
		existing.count++;
		topicStats.set(m.topic, existing);
	}

	const topicAverages = Array.from(topicStats.entries()).map(([topic, stats]) => ({
		topic,
		averageMastery: stats.count > 0 ? (stats.total / stats.count) * 100 : 0,
		count: stats.count,
	}));

	const mostChallenging = topicAverages
		.filter((t) => t.count >= 5)
		.sort((a, b) => a.averageMastery - b.averageMastery)
		.slice(0, 5);

	const strongest = topicAverages
		.filter((t) => t.count >= 5)
		.sort((a, b) => b.averageMastery - a.averageMastery)
		.slice(0, 5);

	const uniqueActiveUsers = new Set(
		recentSessions.map((s: typeof studySessions.$inferSelect) => s.userId)
	).size;
	const totalStudyMinutes = recentSessions.reduce(
		(sum: number, s: typeof studySessions.$inferSelect) => sum + (s.durationMinutes || 0),
		0
	);

	return {
		schoolId,
		schoolName: school.name,
		totalLearners: schoolUsers.length,
		averageAccuracy,
		mostChallengingTopics: mostChallenging,
		strongestTopics: strongest,
		activeUsers: uniqueActiveUsers,
		totalStudyMinutes,
	};
}

export async function assignLicenseToLearner(licenseKey: string, learnerEmail: string) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const license = await db.query.schoolLicenses.findFirst({
		where: eq(schoolLicenses.licenseKey, licenseKey),
	});

	if (!license || license.status !== 'active') {
		throw new Error('Invalid or expired license');
	}

	const learner = await db.query.users.findFirst({
		where: eq(users.email, learnerEmail),
	});

	if (!learner) throw new Error('Learner not found');

	await db
		.update(schoolLicenses)
		.set({
			assignedTo: learner.id,
			assignedAt: new Date(),
		})
		.where(eq(schoolLicenses.id, license.id));

	return { success: true, learnerId: learner.id };
}

export async function getSchoolLeaderboard(
	schoolId: string,
	limit = 20
): Promise<LearnerProgress[]> {
	const db = await getDb();

	const schoolUsers = await db.query.users.findMany({
		where: sql`${users.id} IN (
      SELECT user_id FROM ${schoolLicenses} 
      WHERE ${schoolLicenses.schoolId} = ${schoolId} 
      AND ${schoolLicenses.status} = 'active'
    )`,
	});

	const userIds = schoolUsers.map((u: typeof users.$inferSelect) => u.id);

	const progressList = await db.query.userProgress.findMany({
		where: sql`${userProgress.userId} IN ${userIds}`,
	});

	const quizList = await db.query.quizResults.findMany({
		where: sql`${quizResults.userId} IN ${userIds}`,
	});

	const masteries = await db.query.topicMastery.findMany({
		where: sql`${topicMastery.userId} IN ${userIds}`,
	});

	const learnerProgress: LearnerProgress[] = schoolUsers.map((user: typeof users.$inferSelect) => {
		const progress = progressList.find(
			(p: typeof userProgress.$inferSelect) => p.userId === user.id
		);
		const quizzes = quizList.filter((q: typeof quizResults.$inferSelect) => q.userId === user.id);
		const userMasteries = masteries.filter(
			(m: typeof topicMastery.$inferSelect) => m.userId === user.id
		);

		const totalQuestions = quizzes.reduce(
			(sum: number, q: typeof quizResults.$inferSelect) => sum + q.totalQuestions,
			0
		);
		const totalCorrect = quizzes.reduce(
			(sum: number, q: typeof quizResults.$inferSelect) => sum + q.score,
			0
		);

		const topicsMastered = userMasteries.filter(
			(m: typeof topicMastery.$inferSelect) => Number(m.masteryLevel) >= 0.8
		).length;
		const weakTopics = userMasteries
			.filter((m: typeof topicMastery.$inferSelect) => Number(m.masteryLevel) < 0.5)
			.map((m: typeof topicMastery.$inferSelect) => m.topic);

		return {
			learnerId: user.id,
			learnerName: user.name || 'Anonymous',
			progress: progress ? Number(progress.totalMarksEarned) : 0,
			accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
			topicsMastered,
			weakTopics: weakTopics.slice(0, 5),
			studyStreak: progress?.streakDays || 0,
		};
	});

	return learnerProgress.sort((a, b) => b.progress - a.progress).slice(0, limit);
}

export async function createSchoolLicense(schoolId: string, count: number, expiresAt?: Date) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');

	const db = await getDb();

	const adminCheck = await db.query.schoolAdmins.findFirst({
		where: and(eq(schoolAdmins.schoolId, schoolId), eq(schoolAdmins.userId, session.user.id)),
	});

	if (!adminCheck) throw new Error('Not authorized');

	const licenses = [];
	for (let i = 0; i < count; i++) {
		const licenseKey = `SCH-${schoolId.slice(0, 8)}-${Date.now()}-${i}`.toUpperCase();

		const [license] = await db
			.insert(schoolLicenses)
			.values({
				schoolId,
				licenseType: 'student',
				licenseKey,
				status: 'active',
				expiresAt,
			})
			.returning();

		licenses.push(license);
	}

	return licenses;
}
