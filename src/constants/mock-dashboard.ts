import { ACHIEVEMENTS } from '@/lib/content-adapter';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import type { UserProgressSummary } from '@/lib/db/progress-actions';
import type { TimelineTask } from '@/types/timeline';

export const MOCK_PROGRESS: UserProgressSummary = {
	totalQuestionsAttempted: 127,
	totalCorrect: 98,
	totalMarksEarned: 2450,
	accuracy: 77,
	streakDays: 12,
	recentSessions: [],
};

export const MOCK_STREAK = {
	currentStreak: 12,
	bestStreak: 21,
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
			unlockedAt: new Date(),
		},
		{
			id: '2',
			achievementId: 'streak-7',
			title: 'Week warrior',
			description: 'Maintain a 7-day streak',
			icon: '🔥',
			unlockedAt: new Date(),
		},
		{
			id: '3',
			achievementId: 'perfect-score',
			title: 'Perfectionist',
			description: 'Get 100% on a quiz',
			icon: '⭐',
			unlockedAt: new Date(),
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
