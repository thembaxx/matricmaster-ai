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
	// Learning achievements
	{
		id: 'first_quiz',
		name: 'First Steps',
		description: 'Complete your first quiz',
		icon: '🎯',
		xpReward: 10,
		condition: { type: 'quiz_complete', threshold: 1 },
		category: 'learning',
		rarity: 'common',
	},
	{
		id: 'quiz_master',
		name: 'Quiz Master',
		description: 'Complete 50 quizzes',
		icon: '🏆',
		xpReward: 100,
		condition: { type: 'quiz_complete', threshold: 50 },
		category: 'learning',
		rarity: 'rare',
	},
	{
		id: 'perfect_score',
		name: 'Perfectionist',
		description: 'Get 100% on any quiz',
		icon: '💯',
		xpReward: 25,
		condition: { type: 'perfect_score', threshold: 1 },
		category: 'learning',
		rarity: 'uncommon',
	},

	// Streak achievements
	{
		id: 'streak_7',
		name: 'Week Warrior',
		description: 'Maintain a 7-day streak',
		icon: '🔥',
		xpReward: 20,
		condition: { type: 'streak', threshold: 7 },
		category: 'streak',
		rarity: 'uncommon',
	},
	{
		id: 'streak_30',
		name: 'Monthly Master',
		description: 'Maintain a 30-day streak',
		icon: '⚡',
		xpReward: 50,
		condition: { type: 'streak', threshold: 30 },
		category: 'streak',
		rarity: 'rare',
	},
	{
		id: 'streak_100',
		name: 'Century Club',
		description: 'Maintain a 100-day streak',
		icon: '👑',
		xpReward: 200,
		condition: { type: 'streak', threshold: 100 },
		category: 'streak',
		rarity: 'legendary',
	},

	// Mastery achievements
	{
		id: 'hundred_topics',
		name: 'Knowledge Seeker',
		description: 'Master 100 topics',
		icon: '📚',
		xpReward: 100,
		condition: { type: 'topic_mastery', threshold: 100 },
		category: 'mastery',
		rarity: 'rare',
	},
	{
		id: 'all_subjects',
		name: 'Renaissance Student',
		description: 'Make progress in all subjects',
		icon: '🌟',
		xpReward: 75,
		condition: { type: 'all_subjects', threshold: 1 },
		category: 'mastery',
		rarity: 'epic',
	},

	// APS achievements
	{
		id: 'aps_30',
		name: 'University Bound',
		description: 'Achieve an APS of 30+',
		icon: '🎓',
		xpReward: 50,
		condition: { type: 'aps_milestone', threshold: 30 },
		category: 'special',
		rarity: 'rare',
	},
	{
		id: 'aps_40',
		name: 'Distinction Scholar',
		description: 'Achieve an APS of 40+',
		icon: '🏅',
		xpReward: 100,
		condition: { type: 'aps_milestone', threshold: 40 },
		category: 'special',
		rarity: 'epic',
	},

	// Flashcard achievements
	{
		id: 'flashcard_100',
		name: 'Card Shark',
		description: 'Review 100 flashcards',
		icon: '🃏',
		xpReward: 25,
		condition: { type: 'flashcard_review', threshold: 100 },
		category: 'learning',
		rarity: 'uncommon',
	},

	// Time-based achievements
	{
		id: 'early_bird',
		name: 'Early Bird',
		description: 'Study before 7am',
		icon: '🌅',
		xpReward: 10,
		condition: { type: 'quiz_complete', threshold: 1, metadata: { timeBefore: 7 } },
		category: 'special',
		rarity: 'common',
	},
	{
		id: 'night_owl',
		name: 'Night Owl',
		description: 'Study after 10pm',
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
