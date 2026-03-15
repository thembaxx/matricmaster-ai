'use client';

import { create } from 'zustand';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

interface SubscriptionState {
	tier: SubscriptionTier;
	isTrial: boolean;
	trialEndsAt: Date | null;
	features: {
		unlimitedQuizzes: boolean;
		aiExplanations: boolean;
		voiceTutor: boolean;
		analytics: boolean;
		prioritySupport: boolean;
		offlineMode: boolean;
	};
	checkFeature: (feature: keyof SubscriptionState['features']) => boolean;
	setTier: (tier: SubscriptionTier) => void;
	setTrial: (isTrial: boolean, endsAt?: Date) => void;
}

const FEATURES_BY_TIER: Record<SubscriptionTier, SubscriptionState['features']> = {
	free: {
		unlimitedQuizzes: false,
		aiExplanations: true,
		voiceTutor: false,
		analytics: false,
		prioritySupport: false,
		offlineMode: false,
	},
	pro: {
		unlimitedQuizzes: true,
		aiExplanations: true,
		voiceTutor: true,
		analytics: true,
		prioritySupport: false,
		offlineMode: true,
	},
	enterprise: {
		unlimitedQuizzes: true,
		aiExplanations: true,
		voiceTutor: true,
		analytics: true,
		prioritySupport: true,
		offlineMode: true,
	},
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
	tier: 'free',
	isTrial: false,
	trialEndsAt: null,
	features: FEATURES_BY_TIER.free,

	checkFeature: (feature) => {
		const state = get();
		// Trial users get all features
		if (state.isTrial) return true;
		return state.features[feature];
	},

	setTier: (tier) => {
		set({
			tier,
			features: FEATURES_BY_TIER[tier],
		});
	},

	setTrial: (isTrial, endsAt) => {
		set({
			isTrial,
			trialEndsAt: endsAt ?? null,
		});
	},
}));
