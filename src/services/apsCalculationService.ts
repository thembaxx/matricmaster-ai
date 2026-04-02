'use server';

import { and, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { NSC_GRADE_POINTS } from '@/lib/constants/aps-grade-points';
import { dbManager } from '@/lib/db';
import { universityTargets, userApsScores } from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

async function ensureAuthenticated() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) throw new Error('Unauthorized');
	return session.user;
}

export interface GradePoints {
	grade: string;
	points: number;
	description: string;
}

// NSC_GRADE_POINTS is now imported from @/lib/constants/aps-grade-points

// Additional language bonuses
export const LANGUAGE_BONUS_POINTS: Record<string, number> = {
	'Afrikaans HL': 1,
	'English HL': 1,
	'Zulu HL': 1,
	'Xhosa HL': 1,
	'Sepedi HL': 1,
	'Afrikaans FAL': 0,
	'English FAL': 0,
};

// Distinction level bonuses
export const DISTINCTION_BONUS = 2;

export function calculateSubjectAps(
	subjectGrade: string,
	isHomeLanguage = false,
	isFirstAdditionalLanguage = false
): number {
	const basePoints = NSC_GRADE_POINTS[subjectGrade] || 0;

	if (isHomeLanguage && basePoints >= 5) {
		return basePoints + LANGUAGE_BONUS_POINTS['English HL'] || 0;
	}

	if (isFirstAdditionalLanguage && basePoints >= 4) {
		return basePoints + 1;
	}

	return basePoints;
}

export function calculateTotalAps(
	subjectScores: Array<{
		subject: string;
		grade: string;
		isHomeLanguage?: boolean;
		isFirstAdditional?: boolean;
	}>
): number {
	let totalAps = 0;
	let lifeOrientationPoints = 0;
	const academicSubjects: number[] = [];

	for (const subj of subjectScores) {
		const isLO = subj.subject.toLowerCase().includes('life orientation');

		if (isLO) {
			const gradePoints = NSC_GRADE_POINTS[subj.grade] || 0;
			lifeOrientationPoints = gradePoints >= 5 ? 1 : 0;
		} else {
			const points = calculateSubjectAps(subj.grade, subj.isHomeLanguage, subj.isFirstAdditional);
			academicSubjects.push(points);
		}
	}

	// Sum top 6 academic subjects (excluding Life Orientation)
	academicSubjects.sort((a, b) => b - a);
	const top6 = academicSubjects.slice(0, 6);
	totalAps = top6.reduce((sum, pts) => sum + pts, 0);

	// Add Life Orientation bonus
	totalAps += lifeOrientationPoints;

	return totalAps;
}

export async function updateUserApsScore(
	subject: string,
	grade: string,
	assessmentType?: string,
	assessmentScore?: number
): Promise<{ newTotalAps: number; change: number }> {
	const user = await ensureAuthenticated();
	const db = await getDb();

	const currentScore = NSC_GRADE_POINTS[grade] || 0;

	const existing = await db.query.userApsScores.findFirst({
		where: and(eq(userApsScores.userId, user.id), eq(userApsScores.subject, subject)),
	});

	if (existing) {
		await db
			.update(userApsScores)
			.set({
				currentGrade: grade,
				apsPoints: currentScore,
				lastAssessmentType: assessmentType,
				lastAssessmentScore: assessmentScore,
				lastUpdatedAt: new Date(),
			})
			.where(eq(userApsScores.id, existing.id));
	} else {
		await db.insert(userApsScores).values({
			userId: user.id,
			subject,
			currentGrade: grade,
			apsPoints: currentScore,
			lastAssessmentType: assessmentType,
			lastAssessmentScore: assessmentScore,
		});
	}

	const allScores = await db
		.select({ apsPoints: userApsScores.apsPoints })
		.from(userApsScores)
		.where(eq(userApsScores.userId, user.id));

	const newTotalAps = allScores.reduce(
		(sum: number, s: { apsPoints: number | null }) => sum + (s.apsPoints || 0),
		0
	);
	const change = newTotalAps - (existing?.apsPoints || 0);

	return { newTotalAps, change };
}

export async function getUserApsBreakdown(userId?: string): Promise<{
	totalAps: number;
	subjects: Array<{ subject: string; grade: string; points: number }>;
	targetAps: number | null;
	gap: number;
}> {
	const user = userId ? ({ id: userId } as any) : await ensureAuthenticated();

	const db = await getDb();

	const scores = await db.query.userApsScores.findMany({
		where: eq(userApsScores.userId, user.id),
	});

	const totalAps = scores.reduce(
		(sum: number, s: { apsPoints: number | null }) => sum + (s.apsPoints || 0),
		0
	);

	const targets = await db.query.universityTargets.findFirst({
		where: and(eq(universityTargets.userId, user.id), eq(universityTargets.isActive, true)),
	});

	const targetAps = targets?.targetAps || null;
	const gap = targetAps ? targetAps - totalAps : 0;

	return {
		totalAps,
		subjects: scores.map((s: (typeof scores)[number]) => ({
			subject: s.subject,
			grade: s.currentGrade,
			points: s.apsPoints || 0,
		})),
		targetAps,
		gap,
	};
}

export function getApsRequirements(
	university: string,
	faculty: string
): {
	minAps: number;
	required: string[];
	recommended: string[];
	scholarshipAps?: number;
} {
	const requirements: Record<string, any> = {
		'University of Cape Town': {
			Engineering: {
				minAps: 42,
				required: ['Mathematics', 'Physical Sciences'],
				recommended: ['Calculus'],
				scholarshipAps: 45,
			},
			'Health Sciences': {
				minAps: 45,
				required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
				recommended: [],
				scholarshipAps: 48,
			},
			Commerce: {
				minAps: 38,
				required: ['Mathematics'],
				recommended: ['Accounting'],
				scholarshipAps: 42,
			},
		},
		'University of Pretoria': {
			Engineering: {
				minAps: 40,
				required: ['Mathematics', 'Physical Sciences'],
				recommended: [],
				scholarshipAps: 44,
			},
			Medicine: {
				minAps: 43,
				required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
				recommended: [],
				scholarshipAps: 46,
			},
			Commerce: { minAps: 36, required: ['Mathematics'], recommended: [], scholarshipAps: 40 },
		},
		'University of the Witwatersrand': {
			Engineering: {
				minAps: 42,
				required: ['Mathematics', 'Physical Sciences'],
				recommended: [],
				scholarshipAps: 45,
			},
			'Health Sciences': {
				minAps: 44,
				required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
				recommended: [],
				scholarshipAps: 47,
			},
		},
		'Stellenbosch University': {
			Engineering: {
				minAps: 38,
				required: ['Mathematics', 'Physical Sciences'],
				recommended: [],
				scholarshipAps: 42,
			},
			Medicine: {
				minAps: 42,
				required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
				recommended: [],
				scholarshipAps: 45,
			},
			Commerce: { minAps: 35, required: ['Mathematics'], recommended: [], scholarshipAps: 38 },
		},
	};

	return requirements[university]?.[faculty] || { minAps: 30, required: [], recommended: [] };
}
