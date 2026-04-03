import { ACHIEVEMENTS } from '@/content';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import type { UserProgressSummary } from '@/lib/db/progress-actions';
import type { TimelineTask } from '@/types/timeline';

export const MOCK_PROGRESS: UserProgressSummary = {
	totalQuestionsAttempted: 127,
	totalCorrect: 98,
	totalMarksEarned: 2450,
	accuracy: 77,
	streakDays: 21,
	recentSessions: [],
};

export const MOCK_STREAK = {
	currentStreak: 21,
	bestStreak: 35,
	lastActivityDate: new Date().toISOString(),
};

export const MOCK_ACHIEVEMENTS = {
	unlocked: [
		{
			id: '1',
			achievementId: 'first-quiz',
			title: 'First steps',
			description: 'Complete your first quiz',
			icon: '🎯',
			unlockedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
		},
		{
			id: '2',
			achievementId: 'streak-7',
			title: 'Week warrior',
			description: 'Maintain a 7-day streak',
			icon: '🔥',
			unlockedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
		},
		{
			id: '3',
			achievementId: 'perfect-score',
			title: 'Perfectionist',
			description: 'Get 100% on a quiz',
			icon: '⭐',
			unlockedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
		},
		{
			id: '4',
			achievementId: 'streak-14',
			title: 'Two week titan',
			description: 'Maintain a 14-day streak',
			icon: '💪',
			unlockedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
		},
		{
			id: '5',
			achievementId: 'quiz-master',
			title: 'Quiz master',
			description: 'Complete 50 quizzes',
			icon: '🏆',
			unlockedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
		},
		{
			id: '6',
			achievementId: 'streak-21',
			title: 'Three week champion',
			description: 'Maintain a 21-day streak',
			icon: '👑',
			unlockedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
		},
		{
			id: '7',
			achievementId: 'question-warrior',
			title: 'Question warrior',
			description: 'Answer 500 questions correctly',
			icon: '⚔️',
			unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		},
		{
			id: '8',
			achievementId: 'early-bird',
			title: 'Early bird',
			description: 'Study before 6am',
			icon: '🌅',
			unlockedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
		},
		{
			id: '9',
			achievementId: 'night-owl',
			title: 'Night owl',
			description: 'Study after midnight',
			icon: '🦉',
			unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
		},
		{
			id: '10',
			achievementId: 'subject-master-math',
			title: 'Math master',
			description: 'Achieve 90%+ accuracy in Mathematics',
			icon: '📐',
			unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
		},
		{
			id: '11',
			achievementId: 'subject-master-physics',
			title: 'Physics pro',
			description: 'Achieve 90%+ accuracy in Physical Sciences',
			icon: '⚛️',
			unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
		},
		{
			id: '12',
			achievementId: 'marathon',
			title: 'Marathon learner',
			description: 'Study for 3 hours in one session',
			icon: '🏃',
			unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		},
		{
			id: '13',
			achievementId: 'consistency-king',
			title: 'Consistency king',
			description: 'Study every day for 30 days',
			icon: '👑',
			unlockedAt: new Date(),
		},
		{
			id: '14',
			achievementId: 'streak-7-master',
			title: '7-Day Streak Master',
			description: 'Maintain a 7-day study streak for a full month',
			icon: '🛡️',
			unlockedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
		},
		{
			id: '15',
			achievementId: '100-questions-club',
			title: '100 Questions Club',
			description: 'Answer 100 questions correctly across all subjects',
			icon: '🏅',
			unlockedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
		},
		{
			id: '16',
			achievementId: 'math-perfectionist',
			title: 'Math Perfectionist',
			description: 'Score 100% on 5 Mathematics quizzes in a row',
			icon: '📐',
			unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		},
		{
			id: '17',
			achievementId: 'night-owl-scholar',
			title: 'Night Owl Scholar',
			description: 'Complete 10 study sessions after 10pm',
			icon: '🌙',
			unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
		},
		{
			id: '18',
			achievementId: 'physics-pro',
			title: 'Physics Pro',
			description: 'Achieve 90%+ accuracy in Physical Sciences for 2 weeks',
			icon: '⚛️',
			unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		},
		{
			id: '19',
			achievementId: 'essay-champion',
			title: 'Essay Champion',
			description: 'Score above 85% on 3 English essay quizzes',
			icon: '✍️',
			unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
		},
	] as UserAchievement[],
	available: ACHIEVEMENTS,
} as const;

export interface DashboardInitialStreak {
	currentStreak: number;
	bestStreak: number;
	lastActivityDate: string | null;
}

export interface BriefingData {
	apsProgress: {
		currentAps: number;
		targetAps: number;
		pointsThisMonth: number;
		universityTarget?: string;
	};
	weakTopics: Array<{
		topic: string;
		subject: string;
		confidence: number;
	}>;
	streak: {
		currentStreak: number;
		hasStudiedToday: boolean;
	};
	greeting: string;
	motivationalMessage?: string;
	quickTips?: string[];
	hasAiGreeting: boolean;
}

export const DEMO_TIMELINE: TimelineTask[] = [
	{
		id: 't1',
		title: 'Calculus',
		subject: 'Mathematics',
		subjectEmoji: '🧮',
		subjectColor: 'bg-tiimo-yellow',
		startTime: '08:00',
		endTime: '09:00',
		duration: 60,
		completed: true,
		priority: 'high',
	},
	{
		id: 't2',
		title: 'Mechanics',
		subject: 'Physics',
		subjectEmoji: '⚛️',
		subjectColor: 'bg-tiimo-blue',
		startTime: '10:00',
		endTime: '11:00',
		duration: 60,
		completed: false,
		priority: 'high',
	},
	{
		id: 't3',
		title: 'Essay Review',
		subject: 'English',
		subjectEmoji: '📝',
		subjectColor: 'bg-tiimo-lavender',
		startTime: '13:00',
		endTime: '14:00',
		duration: 60,
		completed: false,
		priority: 'medium',
	},
	{
		id: 't4',
		title: 'Cell Biology',
		subject: 'Life Sciences',
		subjectEmoji: '🧬',
		subjectColor: 'bg-tiimo-green',
		startTime: '15:00',
		endTime: '16:00',
		duration: 60,
		completed: false,
		priority: 'medium',
	},
];

export interface QuickAction {
	id: string;
	label: string;
	icon: string;
	href: string;
	color: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
	{ id: 'quiz', label: 'Start Quiz', icon: '🎯', href: '/quiz', color: 'bg-tiimo-lavender' },
	{
		id: 'flashcards',
		label: 'Flashcards',
		icon: '📚',
		href: '/flashcards',
		color: 'bg-tiimo-yellow',
	},
	{ id: 'practice', label: 'Practice', icon: '✏️', href: '/practice', color: 'bg-tiimo-blue' },
	{ id: 'review', label: 'Review', icon: '🔄', href: '/review', color: 'bg-tiimo-green' },
];
