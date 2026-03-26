import 'server-only';
import { and, asc, eq } from 'drizzle-orm';
import {
	ACHIEVEMENTS,
	type AchievementContent,
	GAMIFICATION,
	type GamificationConfig as StaticGamificationConfig,
	SUBJECTS,
	type SubjectContent,
} from '@/content';
import { getDb } from '../index';
import {
	type AchievementDefinition,
	achievementDefinitions,
	type GamificationConfig,
	gamificationConfig,
	type Question,
	questions,
	type Subject,
	subjects,
} from '../schema';

/**
 * Fetches all subjects ordered by displayOrder.
 * Falls back to static SUBJECTS JSON if the DB is unavailable.
 */
export async function getSubjects(): Promise<Subject[] | SubjectContent[]> {
	try {
		const db = await getDb();
		return await db.select().from(subjects).orderBy(asc(subjects.displayOrder));
	} catch {
		return SUBJECTS;
	}
}

/**
 * Fetches a single subject by its slug.
 * Falls back to static SUBJECTS lookup if the DB is unavailable.
 */
export async function getSubjectBySlug(
	slug: string
): Promise<Subject | SubjectContent | undefined> {
	try {
		const db = await getDb();
		const result = await db.select().from(subjects).where(eq(subjects.slug, slug));
		return result[0];
	} catch {
		return SUBJECTS.find((s) => s.id === slug);
	}
}

/**
 * Fetches subjects where isSupported is true, ordered by displayOrder.
 * Falls back to filtered static SUBJECTS if the DB is unavailable.
 */
export async function getSupportedSubjects(): Promise<Subject[] | SubjectContent[]> {
	try {
		const db = await getDb();
		return await db
			.select()
			.from(subjects)
			.where(eq(subjects.isSupported, true))
			.orderBy(asc(subjects.displayOrder));
	} catch {
		return SUBJECTS.filter((s) => s.isSupported);
	}
}

/**
 * Fetches all active achievement definitions ordered by displayOrder.
 * Falls back to static ACHIEVEMENTS JSON if the DB is unavailable.
 */
export async function getAchievements(): Promise<AchievementDefinition[] | AchievementContent[]> {
	try {
		const db = await getDb();
		return await db
			.select()
			.from(achievementDefinitions)
			.where(eq(achievementDefinitions.isActive, true))
			.orderBy(asc(achievementDefinitions.displayOrder));
	} catch {
		return ACHIEVEMENTS;
	}
}

/**
 * Fetches questions for a subject by slug, optionally filtered by gradeLevel.
 * Joins questions with subjects on subjectId.
 * Falls back to an empty array if the DB is unavailable (no static questions data).
 */
export async function getQuestions(subjectSlug: string, gradeLevel?: number): Promise<Question[]> {
	try {
		const db = await getDb();
		const conditions = [eq(subjects.slug, subjectSlug), eq(questions.isActive, true)];
		if (gradeLevel !== undefined) {
			conditions.push(eq(questions.gradeLevel, gradeLevel));
		}

		const result = await db
			.select({ question: questions })
			.from(questions)
			.innerJoin(subjects, eq(questions.subjectId, subjects.id))
			.where(and(...conditions));

		return result.map((r) => r.question);
	} catch {
		return [];
	}
}

/**
 * Fetches all gamification config entries as a key-value map.
 * Falls back to static GAMIFICATION config if the DB is unavailable.
 */
export async function getGamificationConfig(): Promise<
	GamificationConfig[] | StaticGamificationConfig['config']
> {
	try {
		const db = await getDb();
		return await db.select().from(gamificationConfig);
	} catch {
		return GAMIFICATION.config;
	}
}
