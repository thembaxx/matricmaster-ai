// Local type definitions (based on existing patterns in codebase)
export type SAProvince =
	| 'gauteng'
	| 'western-cape'
	| 'kwazulu-natal'
	| 'eastern-cape'
	| 'free-state'
	| 'mpumalanga'
	| 'north-west'
	| 'limpopo'
	| 'northern-cape';

export type MasteryLevel = 'novice' | 'learning' | 'proficient' | 'mastered' | 'expert';

export type QuizType = 'practice' | 'test' | 'past-paper' | 'challenge';

// SubjectKey - can be SubjectId or custom key
export type SubjectKey = string;

// ============================================
// Animation Configuration per UI/UX Wiki
// ============================================

export interface AnimationDurationConfig {
	pressHover: 120 | 140 | 160 | 180;
	smallState: 180 | 200 | 220 | 240 | 260;
	userInitiatedMax: 300;
}

export interface SpringConfig {
	stiffness: number;
	damping: number;
	mass: number;
}

export interface AnimationSpringConfig {
	gestures: SpringConfig;
	interruptible: SpringConfig;
	preservesVelocity: boolean;
	balanced: SpringConfig;
}

export interface AnimationEasingConfig {
	entrance: 'easeOut' | 'ease-out';
	exit: 'easeIn' | 'ease-in';
	transition: 'easeInOut' | 'ease-in-out';
	linearOnlyProgress: boolean;
}

export interface AnimationExitConfig {
	requiresWrapper: boolean;
	propRequired: boolean;
	keyRequired: boolean;
	matchesInitial: boolean;
}

export interface AnimationAccessibilityConfig {
	reducedMotion: boolean;
	audioToggle: boolean;
	visualEquivalent: boolean;
}

export interface AnimationConfig {
	duration: AnimationDurationConfig;
	spring: AnimationSpringConfig;
	easing: AnimationEasingConfig;
	exit: AnimationExitConfig;
	accessibility: AnimationAccessibilityConfig;
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
	duration: {
		pressHover: 160,
		smallState: 220,
		userInitiatedMax: 300,
	},
	spring: {
		gestures: { stiffness: 300, damping: 30, mass: 1 },
		interruptible: { stiffness: 400, damping: 35, mass: 1 },
		preservesVelocity: true,
		balanced: { stiffness: 250, damping: 25, mass: 1 },
	},
	easing: {
		entrance: 'ease-out',
		exit: 'ease-in',
		transition: 'ease-in-out',
		linearOnlyProgress: true,
	},
	exit: {
		requiresWrapper: true,
		propRequired: true,
		keyRequired: true,
		matchesInitial: true,
	},
	accessibility: {
		reducedMotion: false,
		audioToggle: true,
		visualEquivalent: true,
	},
};

// ============================================
// Generator Configuration
// ============================================

export interface GeneratorDomainConfig {
	count: number;
	distribution: Record<string, number>;
}

export interface GeneratorConfig {
	seed: number;
	userCount: number;
	timeRange: {
		start: Date;
		end: Date;
	};
	locale: 'en-ZA';
	animationConfig: AnimationConfig;
	domains: {
		users: GeneratorDomainConfig;
		subjects: GeneratorDomainConfig;
		provinces: GeneratorDomainConfig;
	};
	constraints: {
		maxUsers: number;
		maxTimeSpan: number;
		correlationStrength: number;
	};
}

// ============================================
// Data Models
// ============================================

export interface MockUser {
	id: string;
	type: 'student' | 'parent' | 'admin';
	profile: {
		firstName: string;
		lastName: string;
		email: string;
		avatar?: string;
		grade: 12;
		province: SAProvince;
		school?: string;
		subjects: SubjectKey[];
		language: 'en' | 'af';
	};
	preferences: {
		theme: 'light' | 'dark' | 'system';
		accessibility: {
			reducedMotion: boolean;
			audioEnabled: boolean;
			fontSize: 'normal' | 'large' | 'xlarge';
		};
		notifications: {
			push: boolean;
			email: boolean;
			studyReminders: boolean;
			achievements: boolean;
		};
		studyGoals: {
			weeklyHours: number;
			preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
			focusSubjects: SubjectKey[];
		};
	};
	createdAt: Date;
	lastActiveAt: Date;
	metadata: {
		registrationSource: string;
		referralCode?: string;
		deviceType: 'mobile' | 'tablet' | 'desktop';
	};
}

export interface MockProgress {
	id: string;
	userId: string;
	subject: SubjectKey;
	topicId: string;
	metrics: {
		totalAttempts: number;
		correctAttempts: number;
		averageTime: number;
		streakDays: number;
		weakAreas: string[];
		strongAreas: string[];
	};
	mastery: MasteryLevel;
	lastPracticedAt: Date;
	nextReviewAt: Date;
}

export interface MockQuizSession {
	id: string;
	userId: string;
	type: QuizType;
	subject: SubjectKey;
	topicIds: string[];
	questionCount: number;
	score: number | null;
	duration: number;
	startedAt: Date;
	completedAt?: Date;
	status: 'in_progress' | 'completed' | 'abandoned';
}

export interface MockGamification {
	userId: string;
	xp: {
		total: number;
		weekly: number;
		monthly: number;
	};
	level: {
		current: number;
		title: string;
		progressToNext: number;
	};
	streak: {
		current: number;
		longest: number;
		lastUpdatedAt: Date;
	};
	achievements: string[];
	leaderboard: {
		rank: number;
		percentile: number;
	};
}

export interface MockStudyPath {
	id: string;
	userId: string;
	subject: SubjectKey;
	title: string;
	progress: number;
	milestones: {
		id: string;
		title: string;
		completed: boolean;
		completedAt?: Date;
	}[];
	scheduledItems: {
		id: string;
		topicId: string;
		scheduledFor: Date;
		completed: boolean;
	}[];
	createdAt: Date;
	lastActivityAt: Date;
}

export interface MockFlashcardDeck {
	id: string;
	userId: string;
	subject: SubjectKey;
	topicIds: string[];
	title: string;
	cardCount: number;
	dueCount: number;
	newCount: number;
	lastStudiedAt?: Date;
	createdAt: Date;
}

export interface MockAnalytics {
	userId: string;
	period: 'daily' | 'weekly' | 'monthly';
	date: Date;
	metrics: {
		activeTime: number;
		questionsAnswered: number;
		accuracy: number;
		topicsCovered: number;
		studySessions: number;
		flashcardsReviewed: number;
		aiConversations: number;
	};
}

// ============================================
// Seed Data
// ============================================

export interface SeedData {
	version: string;
	generated: string;
	config: GeneratorConfig;
	entities: {
		users: MockUser[];
		progress: MockProgress[];
		quizSessions: MockQuizSession[];
		gamification: MockGamification[];
		studyPaths: MockStudyPath[];
		flashcardDecks: MockFlashcardDeck[];
		analytics: MockAnalytics[];
	};
}

// ============================================
// SA Demographic Data
// ============================================

export const SA_PROVINCES: SAProvince[] = [
	'gauteng',
	'western-cape',
	'kwazulu-natal',
	'eastern-cape',
	'free-state',
	'mpumalanga',
	'north-west',
	'limpopo',
	'northern-cape',
];

export const PROVINCE_WEIGHTS: Record<SAProvince, number> = {
	gauteng: 0.35,
	'western-cape': 0.15,
	'kwazulu-natal': 0.18,
	'eastern-cape': 0.08,
	'free-state': 0.07,
	mpumalanga: 0.06,
	'north-west': 0.05,
	limpopo: 0.04,
	'northern-cape': 0.02,
};

export const SA_FIRST_NAMES: Record<string, string[]> = {
	male: [
		'Lethabo',
		'Kgoshi',
		'Thabo',
		'Neo',
		'Tumelo',
		'Karabo',
		'Kagiso',
		'Tshepo',
		'Themba',
		'Sibusiso',
		'Mandla',
		'Siyabonga',
		'Bongani',
		'Sethu',
		'Philani',
		'Sizwe',
		'Andile',
		'Mlungisi',
		'Ayanda',
		'Mluleki',
	],
	female: [
		'Amahle',
		'Lethabo',
		'Noxolo',
		'Thandiwe',
		'Neo',
		'Karabo',
		'Tumelo',
		'Kholifat',
		'Amina',
		'Zanele',
		'Nompumelelo',
		'Nonkululeko',
		'Nomvula',
		'Thembeka',
		'Nothando',
		'Lindiwe',
		'Sibongile',
		'Khethiwe',
		'Nomfundo',
		'Ayanda',
	],
	neutral: ['Neo', 'Tumelo', 'Karabo', 'Lethabo', 'Kagiso', 'Thabo', 'Tshepo', 'Amahle'],
};

export const SA_LAST_NAMES = [
	'Mokoena',
	'Nkosi',
	'Dlamini',
	'Ngema',
	'Mthembu',
	'Ndlovu',
	'Sibeko',
	'Mo Ibrahim',
	'Van der Merwe',
	'Smith',
	'Jones',
	'Williams',
	'Brown',
	'Miller',
	'Davies',
	'Wilson',
	'Mthethwa',
	'Zuma',
	'Buthelezi',
	'Khumalo',
	'Ngcobo',
	'Mhlongo',
	'Nxumalo',
	'Shabalala',
	'Mkhize',
	'Sithole',
	'Chetty',
	'Naidoo',
	'Pillay',
	'Reddy',
	'Govender',
	'Singh',
	'Moodley',
];

export const SA_SCHOOLS = [
	'Holy Cross College',
	'St. Johns College',
	'African Leadership Academy',
	'Pretoria Boys High School',
	'Parktown Boys High School',
	'Grey High School',
	'St. Andrews College',
	'Westerford High School',
	'Rustenburg Girls High',
	'King Edward VII School',
	'Hydepark High',
	'Roedean School',
	"St. Mary's DSG",
	'Knysna Girls High',
	'Queens College Boys High',
	'King Edward VI School',
	'York High School',
	'Gatesville High',
	'Salt River High',
	'Alexander Road High',
];

// ============================================
// Subject Distribution
// ============================================

export const SUBJECT_WEIGHTS: Record<SubjectKey, number> = {
	mathematics: 0.35,
	physics: 0.22,
	'life-sciences': 0.12,
	accounting: 0.08,
	economics: 0.08,
	geography: 0.06,
	history: 0.04,
	english: 0.03,
	afrikaans: 0.02,
	chemistry: 0.0,
	lo: 0.0,
	'business-studies': 0.0,
};

export const ALL_SUBJECTS: SubjectKey[] = [
	'mathematics',
	'physics',
	'chemistry',
	'life-sciences',
	'accounting',
	'economics',
	'geography',
	'history',
	'english',
	'afrikaans',
	'lo',
	'business-studies',
];

// ============================================
// Mastery Level Distribution
// ============================================

export const MASTERY_LEVEL_DISTRIBUTION: Record<MasteryLevel, number> = {
	novice: 0.15,
	learning: 0.3,
	proficient: 0.3,
	mastered: 0.2,
	expert: 0.05,
};

// ============================================
// XP and Level Data
// ============================================

export const LEVEL_TITLES: Record<number, string> = {
	1: 'Novice Learner',
	5: 'Apprentice Scholar',
	10: 'Knowledge Seeker',
	15: 'Dedicated Student',
	20: 'Subject Expert',
	25: 'Academic Achiever',
	30: 'Honour Student',
	35: 'Top Performer',
	40: 'Excellence Award',
	45: 'Scholar of Distinction',
	50: 'Master Achiever',
};

export const XP_PER_LEVEL = 500;
export const XP_FROM_QUIZ = 50;
export const XP_FROM_PERFECT = 100;
export const XP_FROM_STREAK = 25;
export const XP_FROM_ACHIEVEMENT = 75;
export const XP_FROM_DAILY_LOGIN = 10;

// ============================================
// Validation
// ============================================

export const VALIDATION_RULES = {
	user: {
		email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
		province: (province: string) => SA_PROVINCES.includes(province as SAProvince),
		subjects: (subjects: SubjectKey[]) => subjects.length >= 1 && subjects.length <= 7,
	},
	progress: {
		mastery: (level: string) =>
			['novice', 'learning', 'proficient', 'mastered', 'expert'].includes(level),
		metrics: (attempts: number, correct: number) => attempts >= correct,
	},
	quiz: {
		score: (score: number | null) => score === null || (score >= 0 && score <= 100),
		duration: (duration: number) => duration > 0,
		status: (status: string) => ['in_progress', 'completed', 'abandoned'].includes(status),
	},
};

export function validateUser(user: MockUser): boolean {
	if (!VALIDATION_RULES.user.email(user.profile.email)) return false;
	if (!VALIDATION_RULES.user.province(user.profile.province)) return false;
	if (!VALIDATION_RULES.user.subjects(user.profile.subjects)) return false;
	return true;
}

export function validateProgress(progress: MockProgress): boolean {
	if (!VALIDATION_RULES.progress.mastery(progress.mastery)) return false;
	if (
		!VALIDATION_RULES.progress.metrics(
			progress.metrics.totalAttempts,
			progress.metrics.correctAttempts
		)
	)
		return false;
	return true;
}
