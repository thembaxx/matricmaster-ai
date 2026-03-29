import { PLANS, type SubscriptionTier } from '@/lib/subscriptionManager';

export interface Plan {
	id: string;
	name: string;
	description: string;
	priceZar: string;
	billingInterval: string;
	features: string[];
	tier: SubscriptionTier;
}

export interface Subscription {
	planId: string;
	planName: string;
	status: string;
	currentPeriodEnd: Date;
	expiresAt?: string;
}

export interface SubscriptionData {
	plans: Plan[];
	subscription: Subscription | null;
}

export const MOCK_PLANS: Plan[] = PLANS.map((plan) => ({
	id: plan.id,
	name: plan.name,
	description: `${plan.name} Plan`,
	priceZar: plan.priceZar,
	billingInterval: plan.billingInterval,
	features: plan.features,
	tier: plan.tier,
}));

export const TIER_ORDER: SubscriptionTier[] = ['free', 'basic', 'premium', 'pro'];

export function isUpgrade(currentTier: SubscriptionTier, newTier: SubscriptionTier): boolean {
	const currentIndex = TIER_ORDER.indexOf(currentTier);
	const newIndex = TIER_ORDER.indexOf(newTier);
	return newIndex > currentIndex;
}

export function getPlanDisplayName(planId: string): string {
	const plan = MOCK_PLANS.find((p) => p.id === planId);
	return plan?.name || planId;
}

export function getPlanPrice(planId: string): string {
	const plan = MOCK_PLANS.find((p) => p.id === planId);
	return plan ? `R${plan.priceZar}/${plan.billingInterval}` : '';
}

export interface GracePeriodInfo {
	isActive: boolean;
	daysRemaining: number;
	featuresLocked: string[];
}

export function calculateGracePeriod(expiryDate: Date | string): GracePeriodInfo {
	const now = new Date();
	const expiry = new Date(expiryDate);
	const diffTime = now.getTime() - expiry.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) {
		return { isActive: false, daysRemaining: 0, featuresLocked: [] };
	}

	if (diffDays > 3) {
		return { isActive: false, daysRemaining: 0, featuresLocked: ['all'] };
	}

	const daysRemaining = 3 - diffDays;
	const featuresLocked: string[] = [];

	if (diffDays >= 2) {
		featuresLocked.push('pastPapers', 'voiceTutor', 'focusRooms', 'videoCalls');
	} else if (diffDays >= 1) {
		featuresLocked.push('pastPapers', 'voiceTutor', 'focusRooms');
	}

	return {
		isActive: true,
		daysRemaining,
		featuresLocked,
	};
}
