export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro';

export interface FeatureAccess {
	canAccess: boolean;
	isGracePeriod: boolean;
	daysRemaining: number;
	upgradeRequired: boolean;
	tier: SubscriptionTier;
}

export interface SubscriptionPlan {
	id: string;
	tier: SubscriptionTier;
	name: string;
	priceZar: string;
	billingInterval: string;
	features: string[];
	featureKeys: string[];
}

export const FEATURE_TIERS: Record<SubscriptionTier, number> = {
	free: 0,
	basic: 1,
	premium: 2,
	pro: 3,
};

export const GRACE_PERIOD_DAYS = 3;

export const FEATURES = {
	voiceTutor: { minTier: 'premium', description: 'Voice AI Tutor' },
	liveTutoring: { minTier: 'basic', description: 'Live Tutoring Sessions' },
	focusRooms: { minTier: 'premium', description: 'Focus Rooms' },
	pastPapers: { minTier: 'premium', description: 'Past Paper Downloads' },
	aiTutorUnlimited: { minTier: 'pro', description: 'Unlimited AI Tutor Conversations' },
	flashcardGeneration: { minTier: 'basic', description: 'AI Flashcard Generation' },
	studyPlans: { minTier: 'free', description: 'Study Plans' },
	leaderboard: { minTier: 'free', description: 'Leaderboard' },
	achievements: { minTier: 'free', description: 'Achievements' },
	quizAccess: { minTier: 'free', description: 'Quiz Access' },
	topicMastery: { minTier: 'free', description: 'Topic Mastery' },
	groupChallenges: { minTier: 'premium', description: 'Group Challenges' },
	videoCalls: { minTier: 'premium', description: 'Video Calls' },
	analytics: { minTier: 'basic', description: 'Advanced Analytics' },
	prioritySupport: { minTier: 'pro', description: 'Priority Support' },
} as const;

export type FeatureKey = keyof typeof FEATURES;

export const PLANS: SubscriptionPlan[] = [
	{
		id: 'free',
		tier: 'free',
		name: 'Free',
		priceZar: '0',
		billingInterval: 'forever',
		features: [
			'Basic quiz access',
			'Study plans',
			'Leaderboard access',
			'Achievements system',
			'Topic mastery tracking',
			'5 AI tutor messages per day',
		],
		featureKeys: ['quizAccess', 'studyPlans', 'leaderboard', 'achievements', 'topicMastery'],
	},
	{
		id: 'basic',
		tier: 'basic',
		name: 'Basic',
		priceZar: '49',
		billingInterval: 'month',
		features: [
			'Everything in Free',
			'20 AI tutor messages per day',
			'Flashcard generation',
			'Advanced analytics',
			'2 live tutoring sessions/month',
		],
		featureKeys: [
			'quizAccess',
			'studyPlans',
			'leaderboard',
			'achievements',
			'topicMastery',
			'aiTutorUnlimited',
			'flashcardGeneration',
			'analytics',
			'liveTutoring',
		],
	},
	{
		id: 'premium',
		tier: 'premium',
		name: 'Premium',
		priceZar: '99',
		billingInterval: 'month',
		features: [
			'Everything in Basic',
			'Unlimited AI tutor',
			'Voice AI tutor',
			'Focus rooms',
			'Past paper downloads',
			'Group challenges',
			'Video calls',
			'5 live tutoring sessions/month',
		],
		featureKeys: [
			'voiceTutor',
			'liveTutoring',
			'focusRooms',
			'pastPapers',
			'aiTutorUnlimited',
			'flashcardGeneration',
			'studyPlans',
			'leaderboard',
			'achievements',
			'topicMastery',
			'groupChallenges',
			'videoCalls',
			'analytics',
		],
	},
	{
		id: 'pro',
		tier: 'pro',
		name: 'Pro',
		priceZar: '199',
		billingInterval: 'month',
		features: [
			'Everything in Premium',
			'Priority support',
			'Early access to new features',
			'Custom study paths',
			'1-on-1 tutoring sessions',
			'Unlimited everything',
		],
		featureKeys: [
			'voiceTutor',
			'liveTutoring',
			'focusRooms',
			'pastPapers',
			'aiTutorUnlimited',
			'flashcardGeneration',
			'studyPlans',
			'leaderboard',
			'achievements',
			'topicMastery',
			'groupChallenges',
			'videoCalls',
			'analytics',
			'prioritySupport',
		],
	},
];

export function getUserSubscriptionTier(
	subscription: { planId?: string; status?: string } | null
): SubscriptionTier {
	if (!subscription || subscription.status === 'expired') return 'free';
	const tierMap: Record<string, SubscriptionTier> = {
		free: 'free',
		basic: 'basic',
		premium: 'premium',
		pro: 'pro',
	};
	return tierMap[subscription.planId || ''] || 'free';
}

export function getFeatureAccess(
	userTier: SubscriptionTier,
	feature: FeatureKey
): { canAccess: boolean; requiredTier: SubscriptionTier } {
	const featureRequirement = FEATURES[feature];
	if (!featureRequirement) return { canAccess: false, requiredTier: 'premium' };

	const userLevel = FEATURE_TIERS[userTier];
	const requiredLevel = FEATURE_TIERS[featureRequirement.minTier];

	return {
		canAccess: userLevel >= requiredLevel,
		requiredTier: featureRequirement.minTier,
	};
}

export function isInGracePeriod(expiryDate: Date | string): {
	inGracePeriod: boolean;
	daysRemaining: number;
} {
	const now = new Date();
	const expiry = new Date(expiryDate);
	const diffTime = now.getTime() - expiry.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) return { inGracePeriod: false, daysRemaining: 0 };
	if (diffDays > GRACE_PERIOD_DAYS) return { inGracePeriod: false, daysRemaining: 0 };

	return {
		inGracePeriod: true,
		daysRemaining: GRACE_PERIOD_DAYS - diffDays,
	};
}

export function getGracePeriodFeatures(graceDays: number): string[] {
	if (graceDays >= 3) return [];
	if (graceDays >= 2) return ['pastPapers'];
	if (graceDays >= 1) return ['pastPapers', 'voiceTutor', 'focusRooms'];
	return ['pastPapers', 'voiceTutor', 'focusRooms', 'videoCalls'];
}

export function getTierUpgradePath(currentTier: SubscriptionTier): SubscriptionTier[] {
	const currentIndex = FEATURE_TIERS[currentTier];
	return Object.entries(FEATURE_TIERS)
		.filter(([, level]) => level > currentIndex)
		.map(([tier]) => tier as SubscriptionTier)
		.sort((a, b) => FEATURE_TIERS[a] - FEATURE_TIERS[b]);
}

export function getFeaturePreviewLimit(tier: SubscriptionTier): number {
	const limits: Record<SubscriptionTier, number> = {
		free: 1,
		basic: 3,
		premium: 5,
		pro: 999,
	};
	return limits[tier];
}

export function formatFeatureAccessError(feature: FeatureKey): string {
	const featureInfo = FEATURES[feature];
	if (!featureInfo) return 'Feature not available';
	return `${featureInfo.description} requires ${featureInfo.minTier} plan or higher`;
}
