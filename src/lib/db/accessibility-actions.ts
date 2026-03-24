'use server';

import { eq } from 'drizzle-orm';
import { type DbType, dbManager } from './index';
import type { AccessibilityPreferences, NewAccessibilityPreferences } from './schema';
import { accessibilityPreferences } from './schema';

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		throw new Error('Database not available');
	}
	return await dbManager.getDb();
}

export async function getAccessibilityPreferences(
	userId: string
): Promise<AccessibilityPreferences | null> {
	const db = await getDb();
	const result = await db
		.select()
		.from(accessibilityPreferences)
		.where(eq(accessibilityPreferences.userId, userId))
		.limit(1)
		.then((rows) => rows[0]);
	return result || null;
}

export async function getOrCreateAccessibilityPreferences(
	userId: string
): Promise<AccessibilityPreferences> {
	const existing = await getAccessibilityPreferences(userId);
	if (existing) return existing;

	const newPreferences: NewAccessibilityPreferences = {
		userId,
		highContrast: false,
		textSize: '1',
		reducedMotion: false,
		colorBlindMode: 'none',
		simplifiedLanguage: false,
		ttsEnabled: false,
		largerTargets: false,
		keyboardNavigation: false,
		chunkedContent: false,
		progressBreadcrumbs: true,
		oneThingAtATime: false,
		skipLinks: true,
		holdToClick: false,
		focusIndicators: true,
		visualSoundIndicators: true,
	};

	const db = await getDb();
	const created = await db.insert(accessibilityPreferences).values(newPreferences).returning();
	return created[0];
}

export async function updateAccessibilityPreferences(
	userId: string,
	updates: Partial<NewAccessibilityPreferences>
): Promise<AccessibilityPreferences> {
	const db = await getDb();
	await db
		.update(accessibilityPreferences)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(accessibilityPreferences.userId, userId));

	const updated = await getAccessibilityPreferences(userId);
	if (!updated) {
		throw new Error('Failed to update accessibility preferences');
	}
	return updated;
}

export async function setAccessibilityPreference<K extends keyof NewAccessibilityPreferences>(
	userId: string,
	key: K,
	value: NewAccessibilityPreferences[K]
): Promise<AccessibilityPreferences> {
	return updateAccessibilityPreferences(userId, { [key]: value });
}
