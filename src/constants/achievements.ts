/**
 * Achievement Definitions
 * Defines all possible achievements in the app
 */

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
	subjectId?: number; // For subject-specific achievements
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
	// Quiz-based achievements
	{
		id: 'first_quiz',
		name: 'First Steps',
		description: 'Complete your first quiz',
		icon: '🎯',
		iconBg: '#e6f7f0',
		category: 'all',
		requirement: { type: 'quizzes_completed', value: 1 },
		points: 10,
	},
	{
		id: 'quiz_10',
		name: 'Getting Started',
		description: 'Complete 10 quizzes',
		icon: '📝',
		iconBg: '#f0f4f8',
		category: 'all',
		requirement: { type: 'quizzes_completed', value: 10 },
		points: 50,
	},
	{
		id: 'quiz_50',
		name: 'Quiz Enthusiast',
		description: 'Complete 50 quizzes',
		icon: '🧠',
		iconBg: '#fef3c7',
		category: 'all',
		requirement: { type: 'quizzes_completed', value: 50 },
		points: 200,
	},
	{
		id: 'quiz_100',
		name: 'Quiz Master',
		description: 'Complete 100 quizzes',
		icon: '🏆',
		iconBg: '#fce4ec',
		category: 'all',
		requirement: { type: 'quizzes_completed', value: 100 },
		points: 500,
	},

	// Streak achievements
	{
		id: 'streak_3',
		name: 'Consistent',
		description: 'Maintain a 3-day streak',
		icon: '🔥',
		iconBg: '#fff7ed',
		category: 'streak',
		requirement: { type: 'streak_days', value: 3 },
		points: 30,
	},
	{
		id: 'streak_7',
		name: 'Week Warrior',
		description: 'Maintain a 7-day streak',
		icon: '⚡',
		iconBg: '#fef08a',
		category: 'streak',
		requirement: { type: 'streak_days', value: 7 },
		points: 100,
	},
	{
		id: 'streak_30',
		name: 'Monthly Champion',
		description: 'Maintain a 30-day streak',
		icon: '🌟',
		iconBg: '#e0e7ff',
		category: 'streak',
		requirement: { type: 'streak_days', value: 30 },
		points: 500,
	},
	{
		id: 'streak_100',
		name: 'Unstoppable',
		description: 'Maintain a 100-day streak',
		icon: '💎',
		iconBg: '#cffafe',
		category: 'streak',
		requirement: { type: 'streak_days', value: 100 },
		points: 2000,
	},

	// Questions answered achievements
	{
		id: 'questions_100',
		name: 'Question Answerer',
		description: 'Answer 100 questions',
		icon: '❓',
		iconBg: '#f3e8ff',
		category: 'all',
		requirement: { type: 'questions_answered', value: 100 },
		points: 100,
	},
	{
		id: 'questions_500',
		name: 'Question Pro',
		description: 'Answer 500 questions',
		icon: '🎓',
		iconBg: '#ecfeff',
		category: 'all',
		requirement: { type: 'questions_answered', value: 500 },
		points: 400,
	},
	{
		id: 'questions_1000',
		name: 'Knowledge Seeker',
		description: 'Answer 1000 questions',
		icon: '📚',
		iconBg: '#ffedd5',
		category: 'all',
		requirement: { type: 'questions_answered', value: 1000 },
		points: 1000,
	},

	// Perfect score achievements
	{
		id: 'perfect_first',
		name: 'Perfect Start',
		description: 'Get your first perfect score',
		icon: '✨',
		iconBg: '#f0fdfa',
		category: 'all',
		requirement: { type: 'perfect_score', value: 1 },
		points: 50,
	},
	{
		id: 'perfect_10',
		name: 'Perfectionist',
		description: 'Get 10 perfect scores',
		icon: '💯',
		iconBg: '#faf5ff',
		category: 'all',
		requirement: { type: 'perfect_score', value: 10 },
		points: 300,
	},

	// Subject mastery achievements
	{
		id: 'physics_master',
		name: 'Physics Master',
		description: 'Answer 50 Physics questions correctly',
		icon: '⚛️',
		iconBg: '#f0f9ff',
		category: 'science',
		requirement: { type: 'subject_mastery', value: 50, subjectId: 1 }, // Assuming Physics = 1
		points: 200,
	},
	{
		id: 'math_master',
		name: 'Math Wizard',
		description: 'Answer 50 Mathematics questions correctly',
		icon: '🔢',
		iconBg: '#fef3c7',
		category: 'math',
		requirement: { type: 'subject_mastery', value: 50, subjectId: 2 }, // Assuming Math = 2
		points: 200,
	},

	// Bookmark achievements
	{
		id: 'bookmark_5',
		name: 'Saver',
		description: 'Save 5 bookmarks',
		icon: '🔖',
		iconBg: '#fef2f2',
		category: 'all',
		requirement: { type: 'bookmarks', value: 5 },
		points: 25,
	},
	{
		id: 'bookmark_25',
		name: 'Collector',
		description: 'Save 25 bookmarks',
		icon: '📌',
		iconBg: '#f0fdf4',
		category: 'all',
		requirement: { type: 'bookmarks', value: 25 },
		points: 100,
	},

	// Session-based achievements
	{
		id: 'study_10h',
		name: 'Dedicated Student',
		description: 'Study for 10 hours total',
		icon: '⏰',
		iconBg: '#f5f3ff',
		category: 'all',
		requirement: { type: 'time_spent', value: 600 }, // 10 hours in minutes
		points: 200,
	},
	{
		id: 'study_50h',
		name: 'Scholar',
		description: 'Study for 50 hours total',
		icon: '📖',
		iconBg: '#fff7ed',
		category: 'all',
		requirement: { type: 'time_spent', value: 3000 }, // 50 hours in minutes
		points: 1000,
	},
];

// Helper function to get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
	return ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper function to get achievements by category
export function getAchievementsByCategory(
	category: AchievementDefinition['category']
): AchievementDefinition[] {
	if (category === 'all') return ACHIEVEMENTS;
	return ACHIEVEMENTS.filter((a) => a.category === category || a.category === 'all');
}

/**
 * A memoized Map of achievement IDs to their point values.
 * Used for O(1) lookups during XP calculations.
 */
export const ACHIEVEMENT_POINTS_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a.points]));
