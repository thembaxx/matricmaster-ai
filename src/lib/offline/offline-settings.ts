'use client';

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

export interface CachedUserPreferences {
	id: string;
	theme: 'light' | 'dark' | 'system';
	fontSize: 'small' | 'medium' | 'large';
	preferredSubjects: string[];
	defaultView: 'learn' | 'practice' | 'quiz' | 'past-papers';
	notificationsEnabled: boolean;
	studyReminders: StudyReminder[];
	soundEffects: boolean;
	autoSaveProgress: boolean;
	lastActiveSubject: string | null;
	lastActiveTopic: string | null;
	lastVisitedChapter: string | null;
	studyStreak: number;
	lastStudyDate: string | null;
	cachedAt: number;
}

export interface StudyReminder {
	id: string;
	time: string;
	days: number[];
	enabled: boolean;
	message?: string;
}

export interface OfflineExamTimer {
	id: string;
	title: string;
	duration: number;
	startsAt: number;
	pausedAt: number | null;
	remaining: number;
	isPaused: boolean;
	examDate: string;
	subject: string;
}

export interface ExamCountdown {
	id: string;
	examDate: string;
	subject: string;
	title: string;
	daysRemaining: number;
	notifyAt: number;
	notified: boolean;
}

interface SettingsDB extends DBSchema {
	preferences: {
		key: string;
		value: CachedUserPreferences;
	};
	examTimers: {
		key: string;
		value: OfflineExamTimer;
		indexes: { 'by-date': number };
	};
	examCountdowns: {
		key: string;
		value: ExamCountdown;
		indexes: { 'by-date': number };
	};
}

let dbPromise: Promise<IDBPDatabase<SettingsDB>> | null = null;

async function getSettingsDB(): Promise<IDBPDatabase<SettingsDB>> {
	if (!dbPromise) {
		dbPromise = openDB<SettingsDB>('lumni-settings', 1, {
			upgrade(db) {
				db.createObjectStore('preferences', { keyPath: 'id' });

				const timerStore = db.createObjectStore('examTimers', { keyPath: 'id' });
				timerStore.createIndex('by-date', 'startsAt');

				const countdownStore = db.createObjectStore('examCountdowns', { keyPath: 'id' });
				countdownStore.createIndex('by-date', 'examDate');
			},
		});
	}
	return dbPromise;
}

const DEFAULT_PREFERENCES: CachedUserPreferences = {
	id: 'default',
	theme: 'system',
	fontSize: 'medium',
	preferredSubjects: [],
	defaultView: 'learn',
	notificationsEnabled: true,
	studyReminders: [],
	soundEffects: true,
	autoSaveProgress: true,
	lastActiveSubject: null,
	lastActiveTopic: null,
	lastVisitedChapter: null,
	studyStreak: 0,
	lastStudyDate: null,
	cachedAt: Date.now(),
};

export async function getUserPreferences(): Promise<CachedUserPreferences> {
	const db = await getSettingsDB();
	const prefs = await db.get('preferences', 'default');
	return prefs ?? { ...DEFAULT_PREFERENCES, cachedAt: Date.now() };
}

export async function saveUserPreferences(prefs: Partial<CachedUserPreferences>): Promise<void> {
	const db = await getSettingsDB();
	const current = await getUserPreferences();
	await db.put('preferences', {
		...current,
		...prefs,
		cachedAt: Date.now(),
	});
}

export async function updateStudyStreak(): Promise<number> {
	const db = await getSettingsDB();
	const prefs = await getUserPreferences();
	const today = new Date().toISOString().split('T')[0];

	if (prefs.lastStudyDate === today) {
		return prefs.studyStreak;
	}

	const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
	const newStreak = prefs.lastStudyDate === yesterday ? prefs.studyStreak + 1 : 1;

	await db.put('preferences', {
		...prefs,
		studyStreak: newStreak,
		lastStudyDate: today,
		cachedAt: Date.now(),
	});

	return newStreak;
}

export async function saveExamTimer(timer: OfflineExamTimer): Promise<void> {
	const db = await getSettingsDB();
	await db.put('examTimers', timer);
}

export async function getExamTimer(id: string): Promise<OfflineExamTimer | undefined> {
	const db = await getSettingsDB();
	return db.get('examTimers', id);
}

export async function getAllExamTimers(): Promise<OfflineExamTimer[]> {
	const db = await getSettingsDB();
	return db.getAll('examTimers');
}

export async function deleteExamTimer(id: string): Promise<void> {
	const db = await getSettingsDB();
	await db.delete('examTimers', id);
}

export async function saveExamCountdown(countdown: ExamCountdown): Promise<void> {
	const db = await getSettingsDB();
	await db.put('examCountdowns', countdown);
}

export async function getExamCountdowns(): Promise<ExamCountdown[]> {
	const db = await getSettingsDB();
	return db.getAll('examCountdowns');
}

export async function markCountdownNotified(id: string): Promise<void> {
	const db = await getSettingsDB();
	const countdown = await db.get('examCountdowns', id);
	if (countdown) {
		countdown.notified = true;
		await db.put('examCountdowns', countdown);
	}
}

export async function getActiveReminders(): Promise<StudyReminder[]> {
	const prefs = await getUserPreferences();
	return prefs.studyReminders.filter((r) => r.enabled);
}

export async function setStudyReminders(reminders: StudyReminder[]): Promise<void> {
	const db = await getSettingsDB();
	const prefs = await getUserPreferences();
	await db.put('preferences', {
		...prefs,
		studyReminders: reminders,
		cachedAt: Date.now(),
	});
}

export async function clearSettingsCache(): Promise<void> {
	const db = await getSettingsDB();
	await db.clear('preferences');
	await db.clear('examTimers');
	await db.clear('examCountdowns');
}
