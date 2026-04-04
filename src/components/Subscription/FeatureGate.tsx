'use client';

import { LockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import {
	FEATURES,
	type FeatureKey,
	formatFeatureAccessError,
	getFeatureAccess,
	getFeaturePreviewLimit,
	getTierUpgradePath,
	getUserSubscriptionTier,
	isInGracePeriod,
	type SubscriptionTier,
} from '@/lib/subscriptionManager';

interface FeatureGateProps {
	feature: FeatureKey;
	fallback?: ReactNode;
	upgradeMessage?: string;
	showPreviewButton?: boolean;
	children: ReactNode;
}

interface SubscriptionInfo {
	planId?: string;
	status?: string;
	expiresAt?: string;
}

export function FeatureGate({
	feature,
	fallback: _fallback,
	upgradeMessage,
	showPreviewButton = true,
	children,
}: FeatureGateProps) {
	const router = useRouter();
	const { data: session } = useSession();
	const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!session?.user) {
			setIsLoading(false);
			return;
		}

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
	}, [session]);

	const userTier = getUserSubscriptionTier(subscriptionInfo);
	const featureAccess = getFeatureAccess(userTier, feature);
	const featureInfo = FEATURES[feature];

	const gracePeriodInfo = subscriptionInfo?.expiresAt
		? isInGracePeriod(subscriptionInfo.expiresAt)
		: { inGracePeriod: false, daysRemaining: 0 };

	const canAccess =
		featureAccess.canAccess || (gracePeriodInfo.inGracePeriod && gracePeriodInfo.daysRemaining > 0);

	if (!isLoading && canAccess) {
		return <>{children}</>;
	}

	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="h-64 bg-muted rounded-lg" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="flex items-center justify-center min-h-[300px]">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
							<HugeiconsIcon icon={LockIcon} className="w-6 h-6 text-primary" />
						</div>
						<CardTitle>{featureInfo?.description || feature}</CardTitle>
						<CardDescription>Sign in to access this feature</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button className="w-full" onClick={() => router.push('/sign-in')}>
							Sign In
						</Button>
						<p className="text-center text-sm text-muted-foreground">
							Don't have an account?{' '}
							<button
								type="button"
								onClick={() => router.push('/sign-up')}
								className="text-primary hover:underline"
							>
								Sign up
							</button>
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const upgradePath = getTierUpgradePath(userTier);
	const nextTier = upgradePath[0];
	const previewLimit = getFeaturePreviewLimit(userTier);
	const errorMessage = formatFeatureAccessError(feature);

	return (
		<div className="flex items-center justify-center min-h-[300px]">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
						<HugeiconsIcon icon={LockIcon} className="w-6 h-6 text-primary" />
					</div>
					<CardTitle>{featureInfo?.description || feature}</CardTitle>
					<CardDescription>{errorMessage}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-4 bg-muted/50 rounded-lg">
						<h4 className="font-medium mb-2">Your Current Plan: {userTier}</h4>
						<p className="text-sm text-muted-foreground">
							Upgrade to {nextTier} to unlock this feature
						</p>
					</div>

					{upgradeMessage && <p className="text-sm text-muted-foreground">{upgradeMessage}</p>}

					<div className="space-y-2">
						<Button className="w-full" onClick={() => router.push('/subscription')}>
							Upgrade to {nextTier}
						</Button>

						{showPreviewButton && previewLimit > 0 && (
							<Button
								variant="outline"
								className="w-full"
								onClick={() => router.push(`/subscription?preview=${feature}`)}
							>
								Try once (Free)
							</Button>
						)}

						<Button variant="ghost" className="w-full" onClick={() => router.back()}>
							Go Back
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

interface UpgradePromptProps {
	feature: FeatureKey;
	currentTier: SubscriptionTier;
	onUpgrade?: () => void;
	className?: string;
}

export function UpgradePrompt({ feature, currentTier, onUpgrade, className }: UpgradePromptProps) {
	const featureInfo = FEATURES[feature];
	const upgradePath = getTierUpgradePath(currentTier);
	const nextTier = upgradePath[0];

	const router = useRouter();

	const handleUpgrade = () => {
		if (onUpgrade) {
			onUpgrade();
		} else {
			router.push('/subscription');
		}
	};

	return (
		<div className={`p-4 border rounded-lg bg-muted/50 ${className || ''}`}>
			<div className="flex items-center gap-3 mb-3">
				<div className="p-2 rounded-full bg-primary/10">
					<HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-primary" />
				</div>
				<div>
					<h4 className="font-medium">{featureInfo?.description || feature}</h4>
					<p className="text-sm text-muted-foreground">Requires {featureInfo?.minTier} plan</p>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm">
					<span className="text-muted-foreground">Current: </span>
					<span className="font-medium capitalize">{currentTier}</span>
				</div>
				<Button size="sm" onClick={handleUpgrade}>
					Upgrade to {nextTier}
				</Button>
			</div>
		</div>
	);
}

interface PlanBenefitsHoverProps {
	tier: SubscriptionTier;
	children: ReactNode;
}

export function PlanBenefitsHover({ tier, children }: PlanBenefitsHoverProps) {
	const [isHovered, setIsHovered] = useState(false);

	const tierPlans: Record<SubscriptionTier, { features: string[]; price: string }> = {
		free: {
			features: ['Basic quiz access', 'Study plans', '5 AI tutor messages/day'],
			price: 'R0',
		},
		basic: {
			features: ['20 AI tutor messages/day', 'Flashcard generation', 'Advanced analytics'],
			price: 'R49/mo',
		},
		premium: {
			features: ['Unlimited AI tutor', 'Voice AI tutor', 'Focus rooms', 'Past paper downloads'],
			price: 'R99/mo',
		},
		pro: {
			features: [
				'Everything in Premium',
				'Priority support',
				'1-on-1 tutoring',
				'Custom study paths',
			],
			price: 'R199/mo',
		},
	};

	const planInfo = tierPlans[tier];

	return (
		<div
			className="relative inline-block"
			role="button"
			tabIndex={0}
			aria-label={`View ${tier} plan details`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onFocus={() => setIsHovered(true)}
			onBlur={() => setIsHovered(false)}
		>
			{children}

			{isHovered && (
				<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
					<div className="bg-background border rounded-lg shadow-lg p-4 w-64">
						<h4 className="font-semibold mb-2 capitalize">{tier} Plan</h4>
						<p className="text-sm text-muted-foreground mb-3">{planInfo.price}</p>
						<ul className="space-y-1">
							{planInfo.features.map((f, i) => (
								<li key={i} className="text-sm flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-primary" />
									{f}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
