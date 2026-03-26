// ============================================================================
// CONTENT LAYER - Single Source of Truth
// ============================================================================
// All curriculum data is defined in JSON files in this directory.
// The database is seeded from these files. Runtime queries read from the DB.
// This barrel file exports types and loaders for the content.

import achievementsData from './achievements.json';
import examDatesData from './exam-dates.json';
import gamificationData from './gamification.json';
import pastPapersData from './past-papers.json';
import subjectsData from './subjects.json';
import topicWeightagesData from './topic-weightages.json';

// ============================================================================
// TYPES
// ============================================================================

export interface SubjectContent {
	id: string;
	name: string;
	displayName: string;
	curriculumCode: string;
	description: string;
	emoji: string;
	fluentEmoji: string;
	imgSrc?: string;
	color: string;
	bgColor: string;
	icon: string;
	fontFamily: string;
	gradientPrimary: string;
	gradientSecondary: string;
	gradientAccent: string;
	isSupported: boolean;
	isActive: boolean;
	displayOrder: number;
}

export interface AchievementContent {
	id: string;
	name: string;
	description: string;
	icon: string;
	iconBg: string;
	category: string;
	requirementType: string;
	requirementValue: number;
	requirementSubjectId: number | null;
	points: number;
	displayOrder: number;
}

export interface TopicWeightage {
	subject: string;
	topic: string;
	weightagePercent: number;
	examPaper: string;
}

export interface ExamDateEntry {
	subject: string;
	date: string;
	paper: string;
	subjectKey: string;
}

export interface PastPaperContent {
	paperId: string;
	originalPdfUrl: string;
	subject: string;
	paper: string;
	year: number;
	month: string;
	totalMarks: number;
	instructions: string;
	summary: string;
	isExtracted: boolean;
}

export interface StreakMultiplier {
	minStreak: number;
	multiplier: number;
	label: string;
	description: string;
}

export interface DailyLoginReward {
	day: number;
	xpBonus: number;
	streakFreeze?: boolean;
	specialReward?: string;
}

export interface GamificationConfig {
	config: Record<string, { value: string; description: string }>;
	levelTitles: Record<number, string>;
	levelColors: Record<number, string>;
	levelBadgeIcons: Record<number, string>;
	levelMilestones: readonly number[];
	streakMultipliers: StreakMultiplier[];
	maxStreakFreezes: number;
	streakFreezeCostXp: number;
	dailyLoginRewards: DailyLoginReward[];
}

// ============================================================================
// STATIC DATA EXPORTS (for seed scripts, build-time, and fallback)
// ============================================================================

export const SUBJECTS = subjectsData as SubjectContent[];
export const ACHIEVEMENTS = achievementsData as AchievementContent[];
export const GAMIFICATION = gamificationData as GamificationConfig;
export const TOPIC_WEIGHTAGES = topicWeightagesData as TopicWeightage[];
export const EXAM_DATES = examDatesData as ExamDateEntry[];
export const PAST_PAPERS = pastPapersData as PastPaperContent[];

/** Alias for EXAM_DATES - backward compat with old constants/exam-dates */
export const NSC_EXAM_DATES = EXAM_DATES;

/** Subject colors map for calendar/scheduler UI */
export const SUBJECT_COLORS: Record<string, string> = Object.fromEntries(
	SUBJECTS.map((s) => [s.name, s.gradientPrimary])
);

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

const subjectsById = new Map(SUBJECTS.map((s) => [s.id, s]));
const achievementsById = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function getSubjectById(id: string): SubjectContent | undefined {
	return subjectsById.get(id);
}

export function getSubjectName(id: string): string {
	return subjectsById.get(id)?.name ?? id;
}

export function getSubjectEmoji(id: string): string {
	return subjectsById.get(id)?.emoji ?? '📖';
}

export function getSubjectColor(id: string): string {
	return subjectsById.get(id)?.color ?? 'text-foreground';
}

export function getSubjectBgColor(id: string): string {
	return subjectsById.get(id)?.bgColor ?? 'bg-muted';
}

export function getSubjectIcon(id: string): string {
	return subjectsById.get(id)?.icon ?? 'BookOpen';
}

export function getSubjectFont(id: string): string {
	return subjectsById.get(id)?.fontFamily ?? 'var(--font-body)';
}

export function getSubjectGradient(id: string): {
	primary: string;
	secondary: string;
	accent: string;
} {
	const subject = subjectsById.get(id);
	return {
		primary: subject?.gradientPrimary ?? '#667eea',
		secondary: subject?.gradientSecondary ?? '#764ba2',
		accent: subject?.gradientAccent ?? '#a855f7',
	};
}

export function getSubjectGradientArray(id: string): string[] {
	const g = getSubjectGradient(id);
	return [g.primary, g.secondary, g.accent];
}

export function getSupportedSubjects(): SubjectContent[] {
	return SUBJECTS.filter((s) => s.isSupported);
}

export function getAchievementById(id: string): AchievementContent | undefined {
	return achievementsById.get(id);
}

export function getWeightageForTopic(subject: string, topic: string): number {
	const found = TOPIC_WEIGHTAGES.find(
		(w) =>
			w.subject.toLowerCase() === subject.toLowerCase() &&
			w.topic.toLowerCase() === topic.toLowerCase()
	);
	return found?.weightagePercent ?? 10;
}

// University subject requirements
const UNIVERSITY_REQUIREMENTS: Record<string, Record<string, string[]>> = {
	'University of Cape Town': {
		Engineering: ['Mathematics', 'Physical Sciences'],
		'Health Sciences': ['Mathematics', 'Physical Sciences', 'Life Sciences'],
		Commerce: ['Mathematics', 'Accounting'],
	},
	'University of the Witwatersrand': {
		Engineering: ['Mathematics', 'Physical Sciences'],
		'Health Sciences': ['Mathematics', 'Physical Sciences', 'Life Sciences'],
	},
	'University of Pretoria': {
		Engineering: ['Mathematics', 'Physical Sciences'],
	},
	'Stellenbosch University': {
		Engineering: ['Mathematics', 'Physical Sciences'],
		Medicine: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
	},
	'University of Johannesburg': {
		Engineering: ['Mathematics', 'Physical Sciences'],
		'Health Sciences': ['Mathematics', 'Life Sciences'],
	},
	'University of KwaZulu-Natal': {
		Engineering: ['Mathematics', 'Physical Sciences'],
	},
};

export function getSubjectsForTarget(university: string, faculty: string): string[] {
	return UNIVERSITY_REQUIREMENTS[university]?.[faculty] ?? [];
}

// Gamification helpers
export function getXpForLevel(level: number): number {
	if (level <= 1) return 0;
	return Math.floor(level * level * 50);
}

export function getStreakMultiplier(streak: number): StreakMultiplier {
	const sorted = [...GAMIFICATION.streakMultipliers].sort((a, b) => b.minStreak - a.minStreak);
	for (const mult of sorted) {
		if (streak >= mult.minStreak) return mult;
	}
	return GAMIFICATION.streakMultipliers[0];
}

export function getDailyLoginReward(consecutiveDays: number): DailyLoginReward | null {
	const normalizedDay = ((consecutiveDays - 1) % 30) + 1;
	if (normalizedDay === 21 || normalizedDay === 30) {
		return GAMIFICATION.dailyLoginRewards.find((r) => r.day === normalizedDay) ?? null;
	}
	const cycleDay = ((normalizedDay - 1) % 14) + 1;
	return GAMIFICATION.dailyLoginRewards.find((r) => r.day === cycleDay) ?? null;
}
