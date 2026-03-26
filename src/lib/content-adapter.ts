// ============================================================================
// CONTENT ADAPTER - Backward Compatibility Layer
// ============================================================================
// Re-exports data from @/content (canonical JSON source) shaped to match
// the original interfaces from constants/subjects, constants/achievements,
// and constants/gamification.
//
// Migration: `import { SUBJECTS } from '@/constants/subjects'`
//        →   `import { SUBJECTS } from '@/lib/content-adapter'`

import {
	ACHIEVEMENTS as ACHIEVEMENT_CONTENT,
	type AchievementContent,
	GAMIFICATION,
	SUBJECTS as SUBJECT_CONTENT,
	type SubjectContent,
} from '@/content';

// ============================================================================
// TYPES (from constants/subjects.ts)
// ============================================================================

export type SubjectId =
	| 'mathematics'
	| 'physics'
	| 'chemistry'
	| 'life-sciences'
	| 'english'
	| 'afrikaans'
	| 'geography'
	| 'history'
	| 'accounting'
	| 'economics'
	| 'lo'
	| 'business-studies';

export interface Subject {
	id: SubjectId;
	name: string;
	emoji: string;
	color: string;
	bgColor: string;
	icon: string;
	fluentEmoji: string;
	imgSrc?: string;
	fontFamily: string;
	gradient?: {
		primary: string;
		secondary: string;
		accent: string;
	};
}

// ============================================================================
// SUBJECTS (from content/subjects.json → old Subject shape)
// ============================================================================

function toSubject(s: SubjectContent): Subject {
	return {
		id: s.id as SubjectId,
		name: s.name,
		emoji: s.emoji,
		color: s.color,
		bgColor: s.bgColor,
		icon: s.icon,
		fluentEmoji: s.fluentEmoji,
		imgSrc: s.imgSrc,
		fontFamily: s.fontFamily,
		gradient: {
			primary: s.gradientPrimary,
			secondary: s.gradientSecondary,
			accent: s.gradientAccent,
		},
	};
}

export const SUBJECTS: Record<SubjectId, Subject> = Object.fromEntries(
	SUBJECT_CONTENT.map((s) => [s.id, toSubject(s)])
) as Record<SubjectId, Subject>;

export const NSC_SUPPORTED_SUBJECTS: SubjectId[] = SUBJECT_CONTENT.filter((s) => s.isSupported).map(
	(s) => s.id as SubjectId
);

export const SUBJECT_LIST: Subject[] = Object.values(SUBJECTS);

export const SUBJECT_NAMES: string[] = NSC_SUPPORTED_SUBJECTS.map((id) => SUBJECTS[id].name);

export function isNSCSupportedSubject(subjectIdOrName: string): boolean {
	const normalizedInput = subjectIdOrName.toLowerCase().trim();
	const supportedNames = NSC_SUPPORTED_SUBJECTS.map((id) =>
		SUBJECTS[id]?.name.toLowerCase()
	).filter(Boolean);
	return (
		NSC_SUPPORTED_SUBJECTS.includes(normalizedInput as SubjectId) ||
		supportedNames.includes(normalizedInput)
	);
}

export function getSubjectEmoji(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.emoji ?? '📖';
}

export function getSubjectName(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.name ?? subjectId;
}

export function getSubjectColor(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.color ?? 'text-foreground';
}

export function getSubjectBgColor(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.bgColor ?? 'bg-muted';
}

export function getSubjectIcon(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.icon ?? 'BookOpen';
}

export function getSubjectFluentEmoji(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.fluentEmoji ?? 'Books';
}

export function getSubjectFont(subjectId: string): string {
	return SUBJECTS[subjectId as SubjectId]?.fontFamily ?? 'var(--font-body)';
}

export function getSubjectGradient(subjectId: string): {
	primary: string;
	secondary: string;
	accent: string;
} {
	return (
		SUBJECTS[subjectId as SubjectId]?.gradient ?? {
			primary: '#667eea',
			secondary: '#764ba2',
			accent: '#a855f7',
		}
	);
}

export function getSubjectGradientArray(subjectId: string): string[] {
	const gradient = getSubjectGradient(subjectId);
	return [gradient.primary, gradient.secondary, gradient.accent];
}

// ============================================================================
// TYPES (from constants/achievements.ts)
// ============================================================================

export interface AchievementDefinition {
	id: string;
	name: string;
	description: string;
	icon: string;
	iconBg: string;
	category: 'all' | 'science' | 'math' | 'history' | 'streak';
	requirement: AchievementRequirement;
	points: number;
}

export interface AchievementRequirement {
	type:
		| 'quizzes_completed'
		| 'streak_days'
		| 'questions_answered'
		| 'perfect_score'
		| 'subject_mastery'
		| 'bookmarks'
		| 'sessions_count'
		| 'time_spent';
	value: number;
	subjectId?: number;
}

// ============================================================================
// ACHIEVEMENTS (from content/achievements.json → old AchievementDefinition shape)
// ============================================================================

function toAchievementDefinition(a: AchievementContent): AchievementDefinition {
	return {
		id: a.id,
		name: a.name,
		description: a.description,
		icon: a.icon,
		iconBg: a.iconBg,
		category: a.category as AchievementDefinition['category'],
		requirement: {
			type: a.requirementType as AchievementRequirement['type'],
			value: a.requirementValue,
			...(a.requirementSubjectId != null ? { subjectId: a.requirementSubjectId } : {}),
		},
		points: a.points,
	};
}

export const ACHIEVEMENTS: AchievementDefinition[] =
	ACHIEVEMENT_CONTENT.map(toAchievementDefinition);

export const ACHIEVEMENTS_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export const ACHIEVEMENT_POINTS_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a.points]));

export function getAchievementById(id: string): AchievementDefinition | undefined {
	return ACHIEVEMENTS_MAP.get(id);
}

export function getAchievementsByCategory(
	category: AchievementDefinition['category']
): AchievementDefinition[] {
	if (category === 'all') return ACHIEVEMENTS;
	return ACHIEVEMENTS.filter((a) => a.category === category || a.category === 'all');
}

// ============================================================================
// TYPES & CONSTANTS (from constants/gamification.ts)
// ============================================================================

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt?: Date;
}

export const ACHIEVEMENT_DEFS = {
	FIRST_QUIZ: {
		id: 'first_quiz',
		title: 'First Steps',
		description: 'Complete your first quiz',
		icon: '🎯',
	},
	STREAK_7: {
		id: 'streak_7',
		title: 'Week Warrior',
		description: 'Maintain a 7-day streak',
		icon: '🔥',
	},
	STREAK_30: {
		id: 'streak_30',
		title: 'Monthly Master',
		description: 'Maintain a 30-day streak',
		icon: '💎',
	},
	PERFECT_QUIZ: {
		id: 'perfect_quiz',
		title: 'Perfect Score',
		description: 'Get 100% on a quiz',
		icon: '⭐',
	},
	FLASHCARD_100: {
		id: 'flashcard_100',
		title: 'Flashcard Pro',
		description: 'Review 100 flashcards',
		icon: '📚',
	},
	TOPIC_MASTER: {
		id: 'topic_master',
		title: 'Topic Master',
		description: 'Achieve 90%+ mastery on 5 topics',
		icon: '🏆',
	},
	STUDY_BUDDY: {
		id: 'study_buddy',
		title: 'Social Learner',
		description: 'Connect with a study buddy',
		icon: '🤝',
	},
	EARLY_BIRD: {
		id: 'early_bird',
		title: 'Early Bird',
		description: 'Study before 7am',
		icon: '🌅',
	},
	NIGHT_OWL: {
		id: 'night_owl',
		title: 'Night Owl',
		description: 'Study after 10pm',
		icon: '🦉',
	},
	CONSISTENT: {
		id: 'consistent',
		title: 'Consistent',
		description: 'Study for 7 days in a row',
		icon: '📈',
	},
} satisfies Record<string, Achievement>;

export interface APSProgress {
	currentAps: number;
	targetAps: number;
	pointsThisMonth: number;
	universityTarget?: string;
	faculty?: string;
}

export const MAX_LEVEL = Number(GAMIFICATION.config.max_level.value);

export const LEVEL_TITLES: Record<number, string> = GAMIFICATION.levelTitles;

export const LEVEL_MILESTONES = GAMIFICATION.levelMilestones;

export const LEVEL_COLORS: Record<number, string> = GAMIFICATION.levelColors;

export const LEVEL_BADGE_ICONS: Record<number, string> = GAMIFICATION.levelBadgeIcons;

export interface StreakMultiplier {
	minStreak: number;
	multiplier: number;
	label: string;
	description: string;
}

export const STREAK_MULTIPLIERS: StreakMultiplier[] =
	GAMIFICATION.streakMultipliers as StreakMultiplier[];

export const MAX_STREAK_FREEZES = GAMIFICATION.maxStreakFreezes;
export const STREAK_FREEZE_COST_XP = GAMIFICATION.streakFreezeCostXp;

export interface DailyLoginReward {
	day: number;
	xpBonus: number;
	streakFreeze?: boolean;
	specialReward?: string;
}

export const DAILY_LOGIN_REWARDS: DailyLoginReward[] =
	GAMIFICATION.dailyLoginRewards as DailyLoginReward[];

export const TOTAL_XP_AT_LEVEL: number[] = (() => {
	const totalXp = new Array(MAX_LEVEL + 1).fill(0);
	let accumulated = 0;
	for (let i = 2; i <= MAX_LEVEL; i++) {
		accumulated += Math.floor(i * i * 50);
		totalXp[i] = accumulated;
	}
	return totalXp;
})();

// ============================================================================
// GAMIFICATION FUNCTIONS (from constants/gamification.ts)
// ============================================================================

export function getXpForLevel(level: number): number {
	if (level <= 1) return 0;
	return Math.floor(level * level * 50);
}

export function getTotalXpForLevel(level: number): number {
	if (level <= 1) return 0;
	if (level > MAX_LEVEL) return TOTAL_XP_AT_LEVEL[MAX_LEVEL];
	return TOTAL_XP_AT_LEVEL[level];
}

export function getLevelColor(level: number): string {
	const thresholds = Object.keys(LEVEL_COLORS)
		.map(Number)
		.sort((a, b) => b - a);
	for (const threshold of thresholds) {
		if (level >= threshold) {
			return LEVEL_COLORS[threshold];
		}
	}
	return LEVEL_COLORS[1];
}

export function getNextMilestone(level: number): number | null {
	for (const milestone of LEVEL_MILESTONES) {
		if (milestone > level) return milestone;
	}
	return null;
}

export function getStreakMultiplier(streak: number): StreakMultiplier {
	const sorted = [...STREAK_MULTIPLIERS].sort((a, b) => b.minStreak - a.minStreak);
	for (const mult of sorted) {
		if (streak >= mult.minStreak) {
			return mult;
		}
	}
	return STREAK_MULTIPLIERS[0];
}

export function getDailyLoginReward(consecutiveDays: number): DailyLoginReward | null {
	const normalizedDay = ((consecutiveDays - 1) % 30) + 1;

	if (normalizedDay === 21 || normalizedDay === 30) {
		return DAILY_LOGIN_REWARDS.find((r) => r.day === normalizedDay) || null;
	}

	const cycleDay = ((normalizedDay - 1) % 14) + 1;
	return DAILY_LOGIN_REWARDS.find((r) => r.day === cycleDay) || null;
}

// ============================================================================
// CURRICULUM RE-EXPORTS
// ============================================================================

export type {
	StudyRecommendation,
	Subject as CurriculumSubject,
	Topic,
	TopicStatus,
} from '@/data/curriculum/types';
