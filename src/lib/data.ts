'use server';

import { and, eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import * as schema from '@/lib/db/schema';

// ============================================================================
// AUTH UTILITIES
// ============================================================================

export async function getCurrentUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return null;
	}

	return session.user;
}

export async function requireAuth() {
	const user = await getCurrentUser();

	if (!user) {
		redirect('/sign-in');
	}

	return user;
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface DashboardStats {
	totalQuestionsAnswered: number;
	correctAnswers: number;
	accuracy: number;
	streak: number;
	recentActivity: ActivityItem[];
	subjects: SubjectProgress[];
}

export interface ActivityItem {
	id: string;
	type: 'quiz' | 'lesson' | 'achievement' | 'bookmark';
	title: string;
	description: string;
	timestamp: Date;
}

export interface SubjectProgress {
	subjectId: number;
	subjectName: string;
	totalQuestions: number;
	answeredQuestions: number;
	accuracy: number;
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
	await requireAuth();

	// Get user's quiz attempts (if you have a quiz_attempts table)
	// For now, return mock data structure that matches your app
	return {
		totalQuestionsAnswered: 0,
		correctAnswers: 0,
		accuracy: 0,
		streak: 0,
		recentActivity: [],
		subjects: [],
	};
});

// ============================================================================
// USER PROFILE DATA
// ============================================================================

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	image?: string;
	createdAt: Date;
	stats: {
		totalQuizzes: number;
		totalQuestions: number;
		accuracy: number;
		studyHours: number;
	};
}

export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
	const user = await getCurrentUser();

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		name: user.name || 'Anonymous User',
		email: user.email || '',
		image: user.image || undefined,
		createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
		stats: {
			totalQuizzes: 0,
			totalQuestions: 0,
			accuracy: 0,
			studyHours: 0,
		},
	};
});

// ============================================================================
// SUBJECTS DATA
// ============================================================================

export interface SubjectWithStats extends schema.Subject {
	questionCount: number;
	userProgress?: number;
}

export const getSubjects = cache(async (): Promise<SubjectWithStats[]> => {
	const db = dbManager.getDb();

	const subjects = (await db.query.subjects.findMany({
		where: eq(schema.subjects.isActive, true),
		with: {
			questions: {
				where: eq(schema.questions.isActive, true),
			},
		},
	})) as unknown as Array<{ questions?: schema.Question[] } & schema.Subject>;

	return subjects.map((subject) => ({
		...subject,
		questionCount: subject.questions?.length || 0,
	}));
});

export const getSubjectById = cache(async (_id: number): Promise<schema.Subject | null> => {
	const db = dbManager.getDb();

	const subject = await db.query.subjects.findFirst({
		where: and(eq(schema.subjects.id, _id), eq(schema.subjects.isActive, true)),
	});

	return subject || null;
});

// ============================================================================
// QUESTIONS DATA
// ============================================================================

export interface QuestionWithOptions extends schema.Question {
	options: schema.Option[];
	subject: schema.Subject;
}

export const getQuestionsBySubject = cache(
	async (subjectId: number, _limit?: number): Promise<QuestionWithOptions[]> => {
		const db = dbManager.getDb();

		const questions = (await db.query.questions.findMany({
			where: and(eq(schema.questions.subjectId, subjectId), eq(schema.questions.isActive, true)),
			with: {
				options: {
					where: eq(schema.options.isActive, true),
				},
				subject: true,
			},
			limit: _limit,
		})) as unknown as QuestionWithOptions[];

		return questions;
	}
);

export const getQuestionById = cache(async (id: string): Promise<QuestionWithOptions | null> => {
	const db = dbManager.getDb();

	const question = await db.query.questions.findFirst({
		where: and(eq(schema.questions.id, id), eq(schema.questions.isActive, true)),
		with: {
			options: {
				where: eq(schema.options.isActive, true),
			},
			subject: true,
		},
	});

	return (question as unknown as QuestionWithOptions) || null;
});

// ============================================================================
// PAST PAPERS DATA
// ============================================================================

export interface PastPaper {
	id: string;
	subject: string;
	year: number;
	term: string;
	paperNumber: number;
	title: string;
	questionCount: number;
	difficulty: 'easy' | 'medium' | 'hard';
}

export const getPastPapers = cache(async (): Promise<PastPaper[]> => {
	// This would typically fetch from a past_papers table
	// For now, return empty array - implement when table exists
	return [];
});

export const getPastPaperById = cache(async (_id: string): Promise<PastPaper | null> => {
	// Implement when past_papers table exists
	return null;
});

// ============================================================================
// LESSONS DATA
// ============================================================================

export interface Lesson {
	id: string;
	subjectId: number;
	subjectName: string;
	topic: string;
	description: string;
	order: number;
	isCompleted: boolean;
}

export const getLessons = cache(async (): Promise<Lesson[]> => {
	// Implement when lessons table exists
	return [];
});

export const getLessonsBySubject = cache(async (_subjectId: number): Promise<Lesson[]> => {
	// Implement when lessons table exists
	return [];
});

// ============================================================================
// STUDY PLAN DATA
// ============================================================================

export interface StudyPlan {
	id: string;
	userId: string;
	subjects: string[];
	hoursPerWeek: number;
	plan: StudyPlanItem[];
	createdAt: Date;
}

export interface StudyPlanItem {
	day: string;
	subject: string;
	topic: string;
	duration: number;
}

export const getStudyPlan = cache(async (): Promise<StudyPlan | null> => {
	const user = await getCurrentUser();

	if (!user) {
		return null;
	}

	// Implement when study_plans table exists
	return null;
});

// ============================================================================
// STUDY PATH DATA
// ============================================================================

export interface StudyPath {
	id: string;
	userId: string;
	currentSubject: string;
	completedTopics: string[];
	nextTopic: string;
	progress: number;
}

export const getStudyPath = cache(async (): Promise<StudyPath | null> => {
	const user = await getCurrentUser();

	if (!user) {
		return null;
	}

	// Implement when study_paths table exists
	return null;
});

// ============================================================================
// LEADERBOARD DATA
// ============================================================================

export interface LeaderboardEntry {
	rank: number;
	userId: string;
	name: string;
	avatar?: string;
	score: number;
	accuracy: number;
	isCurrentUser: boolean;
}

export const getLeaderboard = cache(async (_limit = 10): Promise<LeaderboardEntry[]> => {
	// Implement when user_stats table exists
	return [];
});

// ============================================================================
// BOOKMARKS DATA
// ============================================================================

export interface Bookmark {
	id: string;
	userId: string;
	questionId: string;
	question?: QuestionWithOptions;
	createdAt: Date;
}

export const getBookmarks = cache(async (): Promise<Bookmark[]> => {
	await getCurrentUser();

	// Implement when bookmarks table exists
	return [];
});

// ============================================================================
// ACHIEVEMENTS DATA
// ============================================================================

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	imageUrl?: string;
	requirement: number;
	unlocked: boolean;
	progress: number;
	unlockedAt?: Date;
}

export const getAchievements = cache(async (): Promise<Achievement[]> => {
	await getCurrentUser();

	// Return default achievements structure
	return [
		{
			id: 'first-quiz',
			name: 'First Steps',
			description: 'Complete your first quiz',
			icon: '🎯',
			requirement: 1,
			unlocked: false,
			progress: 0,
		},
		{
			id: 'streak-7',
			name: 'Week Warrior',
			description: 'Maintain a 7-day streak',
			icon: '🔥',
			requirement: 7,
			unlocked: false,
			progress: 0,
		},
		{
			id: 'perfect-score',
			name: 'Perfectionist',
			description: 'Get 100% on a quiz',
			icon: '⭐',
			requirement: 1,
			unlocked: false,
			progress: 0,
		},
		{
			id: 'subject-master',
			name: 'Subject Master',
			description: 'Answer 100 questions in a subject',
			icon: '📚',
			requirement: 100,
			unlocked: false,
			progress: 0,
		},
	];
});

// ============================================================================
// CHANNELS DATA
// ============================================================================

export interface Channel {
	id: string;
	name: string;
	description: string;
	memberCount: number;
	isJoined: boolean;
}

export const getChannels = cache(async (): Promise<Channel[]> => {
	// Implement when channels table exists
	return [];
});

// ============================================================================
// SEARCH DATA
// ============================================================================

export interface SearchResult {
	id: string;
	type: 'question' | 'lesson' | 'past_paper';
	title: string;
	description: string;
	url: string;
}

export const searchContent = cache(async (query: string): Promise<SearchResult[]> => {
	if (!query.trim()) {
		return [];
	}

	const db = dbManager.getDb();

	// Search questions
	const questions = (await db.query.questions.findMany({
		where: and(
			sql`${schema.questions.questionText} ILIKE ${`%${query}%`}`,
			eq(schema.questions.isActive, true)
		),
		limit: 10,
		with: {
			subject: true,
		},
	})) as unknown as Array<{ id: string; topic: string; questionText: string }>;

	return questions.map((q) => ({
		id: q.id,
		type: 'question',
		title: q.topic,
		description: `${q.questionText.substring(0, 100)}...`,
		url: `/quiz?id=${q.id}`,
	}));
});

// ============================================================================
// RECENT ACTIVITY DATA
// ============================================================================

export const getRecentActivity = cache(async (_limit = 5): Promise<ActivityItem[]> => {
	const user = await getCurrentUser();

	if (!user) {
		return [];
	}

	// Implement when activity_logs table exists
	return [];
});

// ============================================================================
// RECOMMENDED CONTENT
// ============================================================================

export interface RecommendedContent {
	questions: QuestionWithOptions[];
	lessons: Lesson[];
	subjects: SubjectWithStats[];
}

export const getRecommendedContent = cache(async (): Promise<RecommendedContent> => {
	// Get active subjects
	const subjects = await getSubjects();

	// Get sample questions from each subject
	const allQuestions: QuestionWithOptions[] = [];
	for (const subject of subjects.slice(0, 3)) {
		const questions = await getQuestionsBySubject(subject.id, 5);
		allQuestions.push(...questions);
	}

	return {
		questions: allQuestions,
		lessons: [],
		subjects: subjects,
	};
});
