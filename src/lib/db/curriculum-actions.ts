'use server';

import { and, asc, eq } from 'drizzle-orm';
import { getDb } from './index';
import type {
	AchievementDefinition,
	GamificationConfig,
	NewAchievementDefinition,
	NewGamificationConfig,
	Subject,
} from './schema';
import { achievementDefinitions, gamificationConfig, subjects } from './schema';

export async function getAllSubjects(): Promise<Subject[]> {
	const db = await getDb();
	return db.select().from(subjects).orderBy(asc(subjects.displayOrder));
}

export async function getSubjectById(subjectSlug: string): Promise<Subject | undefined> {
	const db = await getDb();
	const result = await db.select().from(subjects).where(eq(subjects.slug, subjectSlug));
	return result[0];
}

export async function getSupportedSubjects(): Promise<Subject[]> {
	const db = await getDb();
	return db
		.select()
		.from(subjects)
		.where(eq(subjects.isSupported, true))
		.orderBy(asc(subjects.displayOrder));
}

export async function upsertSubject(data: {
	slug: string;
	name: string;
	displayName: string;
	description?: string | null;
	curriculumCode: string;
	emoji?: string | null;
	fluentEmoji?: string | null;
	imgSrc?: string | null;
	color?: string | null;
	bgColor?: string | null;
	icon?: string | null;
	fontFamily?: string | null;
	gradientPrimary?: string | null;
	gradientSecondary?: string | null;
	gradientAccent?: string | null;
	isSupported?: boolean;
	displayOrder?: number;
}): Promise<Subject> {
	const db = await getDb();
	await db
		.insert(subjects)
		.values({
			...data,
			isSupported: data.isSupported ?? true,
			displayOrder: data.displayOrder ?? 0,
		})
		.onConflictDoUpdate({
			target: subjects.slug,
			set: {
				...data,
				updatedAt: new Date(),
			},
		});
	const result = await db.select().from(subjects).where(eq(subjects.slug, data.slug));
	return result[0]!;
}

export async function getGamificationConfig(key: string): Promise<GamificationConfig | undefined> {
	const db = await getDb();
	const result = await db.select().from(gamificationConfig).where(eq(gamificationConfig.key, key));
	return result[0];
}

export async function getAllGamificationConfig(): Promise<GamificationConfig[]> {
	const db = await getDb();
	return db.select().from(gamificationConfig);
}

export async function setGamificationConfig(
	data: NewGamificationConfig
): Promise<GamificationConfig> {
	const db = await getDb();
	await db
		.insert(gamificationConfig)
		.values(data)
		.onConflictDoUpdate({
			target: gamificationConfig.key,
			set: {
				...data,
				updatedAt: new Date(),
			},
		});
	const result = await db
		.select()
		.from(gamificationConfig)
		.where(eq(gamificationConfig.key, data.key));
	return result[0]!;
}

export async function getAllAchievements(): Promise<AchievementDefinition[]> {
	const db = await getDb();
	return db
		.select()
		.from(achievementDefinitions)
		.where(eq(achievementDefinitions.isActive, true))
		.orderBy(asc(achievementDefinitions.displayOrder));
}

export async function getAchievementById(id: string): Promise<AchievementDefinition | undefined> {
	const db = await getDb();
	const result = await db
		.select()
		.from(achievementDefinitions)
		.where(eq(achievementDefinitions.id, id));
	return result[0];
}

export async function getAchievementsByCategory(
	category: string
): Promise<AchievementDefinition[]> {
	const db = await getDb();
	return db
		.select()
		.from(achievementDefinitions)
		.where(
			and(
				eq(achievementDefinitions.isActive, true),
				category === 'all' ? undefined : eq(achievementDefinitions.category, category)
			)
		)
		.orderBy(asc(achievementDefinitions.displayOrder));
}

export async function upsertAchievement(
	data: NewAchievementDefinition
): Promise<AchievementDefinition> {
	const db = await getDb();
	await db.insert(achievementDefinitions).values(data).onConflictDoUpdate({
		target: achievementDefinitions.id,
		set: data,
	});
	const result = await db
		.select()
		.from(achievementDefinitions)
		.where(eq(achievementDefinitions.id, data.id));
	return result[0]!;
}
