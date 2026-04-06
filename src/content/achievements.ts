export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	xpReward: number;
	condition: {
		type:
			| 'quiz_complete'
			| 'streak'
			| 'perfect_score'
			| 'flashcard_review'
			| 'topic_mastery'
			| 'aps_milestone'
			| 'all_subjects';
		threshold: number;
		metadata?: Record<string, unknown>;
	};
	category: 'learning' | 'streak' | 'mastery' | 'social' | 'special';
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
	// learning achievements
	{
		id: 'first_quiz',
		name: 'first steps',
		description: 'complete your first quiz',
		icon: '🎯',
		xpReward: 10,
		condition: { type: 'quiz_complete', threshold: 1 },
		category: 'learning',
		rarity: 'common',
	},
	{
		id: 'quiz_master',
		name: 'quiz master',
		description: 'complete 50 quizzes',
		icon: '🏆',
		xpReward: 100,
		condition: { type: 'quiz_complete', threshold: 50 },
		category: 'learning',
		rarity: 'rare',
	},
	{
		id: 'perfect_score',
		name: 'perfectionist',
		description: 'get 100% on any quiz',
		icon: '💯',
		xpReward: 25,
		condition: { type: 'perfect_score', threshold: 1 },
		category: 'learning',
		rarity: 'uncommon',
	},

	// streak achievements
	{
		id: 'streak_7',
		name: 'week warrior',
		description: 'maintain a 7-day streak',
		icon: '🔥',
		xpReward: 20,
		condition: { type: 'streak', threshold: 7 },
		category: 'streak',
		rarity: 'uncommon',
	},
	{
		id: 'streak_30',
		name: 'monthly master',
		description: 'maintain a 30-day streak',
		icon: '⚡',
		xpReward: 50,
		condition: { type: 'streak', threshold: 30 },
		category: 'streak',
		rarity: 'rare',
	},
	{
		id: 'streak_100',
		name: 'century club',
		description: 'maintain a 100-day streak',
		icon: '👑',
		xpReward: 200,
		condition: { type: 'streak', threshold: 100 },
		category: 'streak',
		rarity: 'legendary',
	},

	// mastery achievements
	{
		id: 'hundred_topics',
		name: 'knowledge seeker',
		description: 'master 100 topics',
		icon: '📚',
		xpReward: 100,
		condition: { type: 'topic_mastery', threshold: 100 },
		category: 'mastery',
		rarity: 'rare',
	},
	{
		id: 'all_subjects',
		name: 'renaissance student',
		description: 'make progress in all subjects',
		icon: '🌟',
		xpReward: 75,
		condition: { type: 'all_subjects', threshold: 1 },
		category: 'mastery',
		rarity: 'epic',
	},

	// aps achievements
	{
		id: 'aps_30',
		name: 'university bound',
		description: 'achieve an aps of 30+',
		icon: '🎓',
		xpReward: 50,
		condition: { type: 'aps_milestone', threshold: 30 },
		category: 'special',
		rarity: 'rare',
	},
	{
		id: 'aps_40',
		name: 'distinction scholar',
		description: 'achieve an aps of 40+',
		icon: '🏅',
		xpReward: 100,
		condition: { type: 'aps_milestone', threshold: 40 },
		category: 'special',
		rarity: 'epic',
	},

	// flashcard achievements
	{
		id: 'flashcard_100',
		name: 'card shark',
		description: 'review 100 flashcards',
		icon: '🃏',
		xpReward: 25,
		condition: { type: 'flashcard_review', threshold: 100 },
		category: 'learning',
		rarity: 'uncommon',
	},

	// time-based achievements
	{
		id: 'early_bird',
		name: 'early bird',
		description: 'study before 7am',
		icon: '🌅',
		xpReward: 10,
		condition: { type: 'quiz_complete', threshold: 1, metadata: { timeBefore: 7 } },
		category: 'special',
		rarity: 'common',
	},
	{
		id: 'night_owl',
		name: 'night owl',
		description: 'study after 10pm',
		icon: '🦉',
		xpReward: 10,
		condition: { type: 'quiz_complete', threshold: 1, metadata: { timeAfter: 22 } },
		category: 'special',
		rarity: 'common',
	},
];

export function getAchievementById(id: string): Achievement | undefined {
	return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
	return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function checkAchievementCondition(
	achievement: Achievement,
	userStats: Record<string, number>
): boolean {
	const { type, threshold } = achievement.condition;
	const userValue = userStats[type] || 0;
	return userValue >= threshold;
}
