'use client';

import { useEffect, useState } from 'react';
import {
	type FeatureKey,
	getFeatureAccess,
	getUserSubscriptionTier,
	isInGracePeriod,
	type SubscriptionTier,
} from '@/lib/subscriptionManager';

interface UseFeatureAccessResult {
	canAccess: boolean;
	isLoading: boolean;
	userTier: SubscriptionTier;
	requiredTier: SubscriptionTier;
	isGracePeriod: boolean;
	graceDaysRemaining: number | null;
	error: string | null;
}

interface SubscriptionInfo {
	planId?: string;
	status?: string;
	expiresAt?: string;
}

export function useFeatureAccess(feature: FeatureKey): UseFeatureAccessResult {
	const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const userTier = getUserSubscriptionTier(subscriptionInfo);
	const featureAccess = getFeatureAccess(userTier, feature);

	const gracePeriodInfo = subscriptionInfo?.expiresAt
		? isInGracePeriod(subscriptionInfo.expiresAt)
		: { inGracePeriod: false, daysRemaining: 0 };

	const canAccess = featureAccess.canAccess || gracePeriodInfo.inGracePeriod;

	useEffect(() => {
		async function fetchSubscription() {
			try {
				const response = await fetch('/api/subscription/status');
				if (response.ok) {
					const data = await response.json();
					setSubscriptionInfo(data);
				}
			} catch (err) {
				setError('Failed to fetch subscription status');
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchSubscription();
	}, []);

	return {
		canAccess,
		isLoading,
		userTier,
		requiredTier: featureAccess.requiredTier,
		isGracePeriod: gracePeriodInfo.inGracePeriod,
		graceDaysRemaining: gracePeriodInfo.inGracePeriod ? gracePeriodInfo.daysRemaining : null,
		error,
	};
}

export function useFeatureAccessMultiple(
	features: FeatureKey[]
): Record<FeatureKey, UseFeatureAccessResult> {
	const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const userTier = getUserSubscriptionTier(subscriptionInfo);

	useEffect(() => {
		async function fetchSubscription() {
			try {
				const response = await fetch('/api/subscription/status');
				if (response.ok) {
					const data = await response.json();
					setSubscriptionInfo(data);
				}
			} catch (err) {
				setError('Failed to fetch subscription status');
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchSubscription();
	}, []);

	const results: Record<FeatureKey, UseFeatureAccessResult> = {} as Record<
		FeatureKey,
		UseFeatureAccessResult
	>;

	for (const feature of features) {
		const featureAccess = getFeatureAccess(userTier, feature);

		const gracePeriodInfo = subscriptionInfo?.expiresAt
			? isInGracePeriod(subscriptionInfo.expiresAt)
			: { inGracePeriod: false, daysRemaining: 0 };

		const canAccess = featureAccess.canAccess || gracePeriodInfo.inGracePeriod;

		results[feature] = {
			canAccess,
			isLoading,
			userTier,
			requiredTier: featureAccess.requiredTier,
			isGracePeriod: gracePeriodInfo.inGracePeriod,
			graceDaysRemaining: gracePeriodInfo.inGracePeriod ? gracePeriodInfo.daysRemaining : null,
			error,
		};
	}

	return results;
}

export function useCurrentTier(): {
	tier: SubscriptionTier;
	isLoading: boolean;
	subscriptionInfo: SubscriptionInfo | null;
	expiresAt: Date | null;
	isExpired: boolean;
	isGracePeriod: boolean;
	graceDaysRemaining: number | null;
} {
	const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const tier = getUserSubscriptionTier(subscriptionInfo);

	const expiresAt = subscriptionInfo?.expiresAt ? new Date(subscriptionInfo.expiresAt) : null;
	const gracePeriodInfo = expiresAt
		? isInGracePeriod(expiresAt)
		: { inGracePeriod: false, daysRemaining: 0 };

	const now = new Date();
	const isExpired = expiresAt ? now > expiresAt : false;

	useEffect(() => {
		async function fetchSubscription() {
			try {
				const response = await fetch('/api/subscription/status');
				if (response.ok) {
					const data = await response.json();
					setSubscriptionInfo(data);
				}
			} catch {
				// Silently fail
			} finally {
				setIsLoading(false);
			}
		}

		fetchSubscription();
	}, []);

	return {
		tier,
		isLoading,
		subscriptionInfo,
		expiresAt,
		isExpired,
		isGracePeriod: gracePeriodInfo.inGracePeriod,
		graceDaysRemaining: gracePeriodInfo.inGracePeriod ? gracePeriodInfo.daysRemaining : null,
	};
}
