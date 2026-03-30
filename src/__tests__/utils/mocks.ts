import { vi } from 'vitest';
import type { AdaptiveTrigger, WeakTopicAlert } from '@/types/adaptive-learning';
import type { QuizAnswer, QuizResult, QuizSession } from '@/types/quiz';

export interface MockUser {
	id: string;
	email: string;
	name: string;
	role: 'student' | 'parent' | 'tutor' | 'admin';
	avatar: string | null;
	createdAt: Date;
	updatedAt: Date;
	preferences: MockUserPreferences;
	progress?: MockUserProgress;
	subscription?: MockSubscription;
}

export interface MockUserPreferences {
	subjects?: string[];
	studyGoal?: string;
	targetUniversity?: string | null;
	desiredCourse?: string | null;
	dailyStudyTime?: number;
	preferredSessionLength?: number;
	notifications?: {
		reminders?: boolean;
		achievements?: boolean;
		leaderboard?: boolean;
	};
	linkedStudentId?: string;
}

export interface MockUserProgress {
	totalQuestionsAttempted: number;
	totalCorrect: number;
	overallAccuracy: number;
	currentStreak: number;
	bestStreak: number;
	totalStudyHours: number;
	subjectsMastered: string[];
	weakSubjects: string[];
}

export interface MockSubscription {
	plan: 'free' | 'premium';
	status: 'active' | 'cancelled' | 'expired';
	expiresAt: string | null;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
	const now = new Date();
	return {
		id: 'user_123',
		email: 'test@example.com',
		name: 'Test User',
		role: 'student',
		avatar: null,
		createdAt: now,
		updatedAt: now,
		preferences: {
			subjects: ['Mathematics', 'Physical Sciences'],
			studyGoal: 'university_admission',
			targetUniversity: 'University of Pretoria',
			desiredCourse: 'Engineering',
			dailyStudyTime: 120,
			preferredSessionLength: 45,
			notifications: {
				reminders: true,
				achievements: true,
				leaderboard: false,
			},
		},
		progress: {
			totalQuestionsAttempted: 500,
			totalCorrect: 350,
			overallAccuracy: 70,
			currentStreak: 5,
			bestStreak: 15,
			totalStudyHours: 45,
			subjectsMastered: ['Algebra', 'Functions'],
			weakSubjects: ['Trigonometry', 'Calculus'],
		},
		subscription: {
			plan: 'free',
			status: 'active',
			expiresAt: null,
		},
		...overrides,
	};
}

export function createMockQuizSession(overrides: Partial<QuizSession> = {}): QuizSession {
	const now = new Date();
	return {
		quizId: 'quiz_123',
		subjectName: 'Mathematics',
		topic: 'Calculus',
		startedAt: now,
		answers: [],
		currentQuestionIndex: 0,
		...overrides,
	};
}

export function createMockQuizAnswer(overrides: Partial<QuizAnswer> = {}): QuizAnswer {
	return {
		questionId: 'q_001',
		selectedOption: 'a',
		isCorrect: true,
		timeSpentSeconds: 30,
		...overrides,
	};
}

export function createMockQuizResult(overrides: Partial<QuizResult> = {}): QuizResult {
	return {
		correctAnswers: 8,
		totalQuestions: 10,
		durationSeconds: 600,
		accuracy: 80,
		subjectId: 1,
		subjectName: 'Mathematics',
		difficulty: 'medium',
		topic: 'Calculus',
		completedAt: new Date(),
		...overrides,
	};
}

export interface MockStudyPlan {
	id: string;
	userId: string;
	title: string;
	subject: string;
	weeks: MockStudyWeek[];
	createdAt: Date;
	updatedAt: Date;
	status: 'active' | 'completed' | 'paused';
}

export interface MockStudyWeek {
	weekNumber: number;
	topics: MockStudyTopic[];
	studySessions: MockStudySession[];
}

export interface MockStudyTopic {
	id: string;
	name: string;
	subtopics: string[];
	priority: number;
	completed: boolean;
}

export interface MockStudySession {
	id: string;
	date: Date;
	duration: number;
	subject: string;
	topics: string[];
	completed: boolean;
	notes?: string;
}

export function createMockStudyPlan(overrides: Partial<MockStudyPlan> = {}): MockStudyPlan {
	const now = new Date();
	return {
		id: 'plan_123',
		userId: 'user_123',
		title: 'Matric Mathematics Preparation',
		subject: 'Mathematics',
		weeks: [
			{
				weekNumber: 1,
				topics: [
					{
						id: 'topic_1',
						name: 'Algebra',
						subtopics: ['Linear Equations', 'Quadratic Equations'],
						priority: 1,
						completed: false,
					},
				],
				studySessions: [
					{
						id: 'session_1',
						date: now,
						duration: 45,
						subject: 'Mathematics',
						topics: ['Linear Equations'],
						completed: true,
					},
				],
			},
		],
		createdAt: now,
		updatedAt: now,
		status: 'active',
		...overrides,
	};
}

export function createMockWeakTopicAlert(overrides: Partial<WeakTopicAlert> = {}): WeakTopicAlert {
	return {
		topic: 'Trigonometry',
		subject: 'Mathematics',
		score: 45,
		threshold: 60,
		suggestions: ['Practice SOH CAH TOA', 'Review Pythagorean identities'],
		...overrides,
	};
}

export function createMockAdaptiveTrigger(
	overrides: Partial<AdaptiveTrigger> = {}
): AdaptiveTrigger {
	return {
		type: 'weak_topic_flagged',
		topic: 'Calculus',
		subjectId: 1,
		score: 40,
		threshold: 60,
		action: 'ai_tutor_flag',
		...overrides,
	};
}

export const mockNavigate = vi.fn();
export const mockRouter = {
	push: mockNavigate,
	replace: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	refresh: vi.fn(),
	prefetch: vi.fn(),
};

export function createMockQuizQuestion(
	overrides: Partial<{
		id: string;
		type: 'mcq' | 'shortAnswer' | 'trueFalse' | 'matching';
		subject: string;
		topic: string;
		difficulty: 'easy' | 'medium' | 'hard';
		question: string;
		marks: number;
	}> = {}
) {
	return {
		id: 'q_001',
		type: 'mcq' as const,
		subject: 'Mathematics',
		topic: 'Algebra',
		difficulty: 'medium' as const,
		question: 'What is the value of x in the equation 2x + 5 = 15?',
		marks: 2,
		...overrides,
	};
}

export interface MockNotification {
	id: string;
	userId: string;
	type: string;
	title: string;
	message: string;
	read: boolean;
	createdAt: Date;
}

export function createMockNotification(
	overrides: Partial<MockNotification> = {}
): MockNotification {
	const now = new Date();
	return {
		id: 'notif_001',
		userId: 'user_123',
		type: 'achievement',
		title: 'Achievement Unlocked!',
		message: 'You completed your first quiz',
		read: false,
		createdAt: now,
		...overrides,
	};
}

export interface MockAchievement {
	id: string;
	userId: string;
	type: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt: Date;
	progress?: number;
	maxProgress?: number;
}

export function createMockAchievement(overrides: Partial<MockAchievement> = {}): MockAchievement {
	const now = new Date();
	return {
		id: 'ach_001',
		userId: 'user_123',
		type: 'streak',
		title: '7 Day Streak',
		description: 'Study for 7 consecutive days',
		icon: '🔥',
		unlockedAt: now,
		progress: 7,
		maxProgress: 7,
		...overrides,
	};
}
