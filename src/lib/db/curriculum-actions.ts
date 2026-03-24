'use server';

import { and, asc, eq } from 'drizzle-orm';
import { getDb } from './index';
import type {
	AchievementDefinition,
	GamificationConfig,
	NewAchievementDefinition,
	NewGamificationConfig,
	NewSubjectMetadata,
	SubjectMetadata,
} from './schema';
import { achievementDefinitions, gamificationConfig, subjectMetadata } from './schema';

export async function getAllSubjects(): Promise<SubjectMetadata[]> {
	const db = getDb();
	return db.select().from(subjectMetadata).orderBy(asc(subjectMetadata.displayOrder));
}

export async function getSubjectById(subjectId: string): Promise<SubjectMetadata | undefined> {
	const db = getDb();
	const result = await db
		.select()
		.from(subjectMetadata)
		.where(eq(subjectMetadata.subjectId, subjectId));
	return result[0];
}

export async function getSupportedSubjects(): Promise<SubjectMetadata[]> {
	const db = getDb();
	return db
		.select()
		.from(subjectMetadata)
		.where(eq(subjectMetadata.isSupported, true))
		.orderBy(asc(subjectMetadata.displayOrder));
}

export async function upsertSubjectMetadata(data: NewSubjectMetadata): Promise<SubjectMetadata> {
	const db = getDb();
	await db
		.insert(subjectMetadata)
		.values(data)
		.onConflictDoUpdate({
			target: subjectMetadata.subjectId,
			set: {
				...data,
				updatedAt: new Date(),
			},
		});
	const result = await db
		.select()
		.from(subjectMetadata)
		.where(eq(subjectMetadata.subjectId, data.subjectId));
	return result[0]!;
}

export async function getGamificationConfig(key: string): Promise<GamificationConfig | undefined> {
	const db = getDb();
	const result = await db.select().from(gamificationConfig).where(eq(gamificationConfig.key, key));
	return result[0];
}

export async function getAllGamificationConfig(): Promise<GamificationConfig[]> {
	const db = getDb();
	return db.select().from(gamificationConfig);
}

export async function setGamificationConfig(
	data: NewGamificationConfig
): Promise<GamificationConfig> {
	const db = getDb();
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
	const db = getDb();
	return db
		.select()
		.from(achievementDefinitions)
		.where(eq(achievementDefinitions.isActive, true))
		.orderBy(asc(achievementDefinitions.displayOrder));
}

export async function getAchievementById(id: string): Promise<AchievementDefinition | undefined> {
	const db = getDb();
	const result = await db
		.select()
		.from(achievementDefinitions)
		.where(eq(achievementDefinitions.id, id));
	return result[0];
}

export async function getAchievementsByCategory(
	category: string
): Promise<AchievementDefinition[]> {
	const db = getDb();
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
	const db = getDb();
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
