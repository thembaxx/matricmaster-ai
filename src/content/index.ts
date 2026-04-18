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

/** Raw content arrays — for seed scripts, DB fallbacks, and internal helpers */
export const SUBJECTS_CONTENT = subjectsData as SubjectContent[];
export const ACHIEVEMENTS_CONTENT = achievementsData as AchievementContent[];
export const GAMIFICATION = gamificationData as GamificationConfig;
export const TOPIC_WEIGHTAGES = topicWeightagesData as TopicWeightage[];
export const EXAM_DATES = examDatesData as ExamDateEntry[];
export const PAST_PAPERS = pastPapersData as PastPaperContent[];

/** Alias for EXAM_DATES - backward compat with old constants/exam-dates */
export const NSC_EXAM_DATES = EXAM_DATES;

/** Subject colors map for calendar/scheduler UI */
export const SUBJECT_COLORS: Record<string, string> = Object.fromEntries(
	SUBJECTS_CONTENT.map((s) => [s.name, s.gradientPrimary])
);

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

const subjectsById = new Map(SUBJECTS_CONTENT.map((s) => [s.id, s]));

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
	return SUBJECTS_CONTENT.filter((s) => s.isSupported);
}

/** Look up AchievementDefinition by id — matches content-adapter consumer expectations */
export function getAchievementById(id: string): AchievementDefinition | undefined {
	return ACHIEVEMENTS_MAP.get(id);
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

// ============================================================================
// ADAPTER-COMPATIBLE TYPES
// ============================================================================
// Types re-exported from content-adapter for backward compatibility with
// imports from '@/constants/*' and '@/lib/content-adapter'.

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

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt?: Date;
}

export interface APSProgress {
	currentAps: number;
	targetAps: number;
	pointsThisMonth: number;
	universityTarget?: string;
	faculty?: string;
}

export type {
	StudyRecommendation,
	Subject as CurriculumSubject,
	Topic,
	TopicStatus,
} from '@/content/curriculum/types';

// ============================================================================
// ADAPTER-COMPATIBLE CONSTANTS
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

/** SubjectContent[] shaped as Record<SubjectId, Subject> for backward compat */
export const SUBJECTS_MAP: Record<SubjectId, Subject> = Object.fromEntries(
	SUBJECTS_CONTENT.map((s) => [s.id, toSubject(s)])
) as Record<SubjectId, Subject>;

/** Primary export: Record<SubjectId, Subject> — matches what content-adapter consumers expect */
export const SUBJECTS: Record<SubjectId, Subject> = SUBJECTS_MAP;

export const SUBJECT_LIST: Subject[] = Object.values(SUBJECTS_MAP);

export const NSC_SUPPORTED_SUBJECTS: SubjectId[] = SUBJECTS_CONTENT.filter(
	(s) => s.isSupported
).map((s) => s.id as SubjectId);

export const SUBJECT_NAMES: string[] = NSC_SUPPORTED_SUBJECTS.map((id) => SUBJECTS_MAP[id].name);

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

/** AchievementContent[] shaped as AchievementDefinition[] for backward compat */
export const ACHIEVEMENTS_DEFINITIONS: AchievementDefinition[] =
	ACHIEVEMENTS_CONTENT.map(toAchievementDefinition);

/** Primary export: AchievementDefinition[] — matches what content-adapter consumers expect */
export const ACHIEVEMENTS: AchievementDefinition[] = ACHIEVEMENTS_DEFINITIONS;

export const ACHIEVEMENTS_MAP = new Map(ACHIEVEMENTS_DEFINITIONS.map((a) => [a.id, a]));

export const ACHIEVEMENT_POINTS_MAP = new Map(
	ACHIEVEMENTS_DEFINITIONS.map((a) => [a.id, a.points])
);

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

export const STREAK_MULTIPLIERS: StreakMultiplier[] =
	GAMIFICATION.streakMultipliers as StreakMultiplier[];

export const MAX_LEVEL = Number(GAMIFICATION.config.max_level.value);

export const LEVEL_TITLES: Record<number, string> = GAMIFICATION.levelTitles;

export const LEVEL_MILESTONES = GAMIFICATION.levelMilestones;

export const LEVEL_COLORS: Record<number, string> = GAMIFICATION.levelColors;

export const LEVEL_BADGE_ICONS: Record<number, string> = GAMIFICATION.levelBadgeIcons;

export const MAX_STREAK_FREEZES = GAMIFICATION.maxStreakFreezes;
export const STREAK_FREEZE_COST_XP = GAMIFICATION.streakFreezeCostXp;

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
// ADAPTER-COMPATIBLE FUNCTIONS
// ============================================================================

export function isNSCSupportedSubject(subjectIdOrName: string): boolean {
	const normalizedInput = subjectIdOrName.toLowerCase().trim();
	const supportedNames = NSC_SUPPORTED_SUBJECTS.map((id) =>
		SUBJECTS_MAP[id]?.name.toLowerCase()
	).filter(Boolean);
	return (
		NSC_SUPPORTED_SUBJECTS.includes(normalizedInput as SubjectId) ||
		supportedNames.includes(normalizedInput)
	);
}

const SUBJECT_ALIASES: Record<string, string> = {
	'physical-sciences': 'physics',
	physicalsciences: 'physics',
	phys: 'physics',
	physsci: 'physics',
	mathematics: 'mathematics',
	math: 'mathematics',
	chemistry: 'chemistry',
	chem: 'chemistry',
	'life-sciences': 'life-sciences',
	lifesciences: 'life-sciences',
	biology: 'life-sciences',
	bio: 'life-sciences',
	english: 'english',
	efal: 'english',
	afrikaans: 'afrikaans',
	afri: 'afrikaans',
	geography: 'geography',
	geog: 'geography',
	history: 'history',
	hist: 'history',
	accounting: 'accounting',
	acct: 'accounting',
	economics: 'economics',
	econ: 'economics',
	'business-studies': 'business-studies',
	businessstudies: 'business-studies',
	business: 'business-studies',
	'life-orientation': 'lo',
	lifeorientation: 'lo',
	lo: 'lo',
};

export function getSubjectFluentEmoji(id: string): string {
	const normalized = id.toLowerCase().replace(/\s+/g, '-');
	const mappedId = SUBJECT_ALIASES[normalized] ?? normalized;
	return subjectsById.get(mappedId)?.fluentEmoji ?? 'Books';
}

export function getAchievementDefById(id: string): AchievementDefinition | undefined {
	return ACHIEVEMENTS_MAP.get(id);
}

export function getAchievementsByCategory(
	category: AchievementDefinition['category']
): AchievementDefinition[] {
	if (category === 'all') return ACHIEVEMENTS_DEFINITIONS;
	return ACHIEVEMENTS_DEFINITIONS.filter((a) => a.category === category || a.category === 'all');
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
