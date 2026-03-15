'use client';

import { LockIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type SubscriptionTier, useSubscriptionStore } from '@/stores/useSubscriptionStore';

interface FeatureGateProps {
	feature:
		| 'unlimitedQuizzes'
		| 'aiExplanations'
		| 'voiceTutor'
		| 'analytics'
		| 'prioritySupport'
		| 'offlineMode';
	children: ReactNode;
	fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
	const { checkFeature, tier } = useSubscriptionStore();

	if (checkFeature(feature)) {
		return <>{children}</>;
	}

	if (fallback) {
		return <>{fallback}</>;
	}

	return <UpgradePrompt feature={feature} tier={tier} />;
}

interface UpgradePromptProps {
	feature: string;
	tier: SubscriptionTier;
}

export function UpgradePrompt({ feature, tier }: UpgradePromptProps) {
	const featureLabels: Record<string, string> = {
		unlimitedQuizzes: 'Unlimited Quizzes',
		aiExplanations: 'AI Explanations',
		voiceTutor: 'Voice Tutor',
		analytics: 'Advanced Analytics',
		prioritySupport: 'Priority Support',
		offlineMode: 'Offline Mode',
	};

	const featureDescriptions: Record<string, string> = {
		unlimitedQuizzes: 'Take unlimited quizzes to practice all you want',
		aiExplanations: 'Get instant AI-powered explanations for any question',
		voiceTutor: 'Talk to your AI tutor using voice',
		analytics: 'See detailed insights into your study progress',
		prioritySupport: 'Get faster responses from our support team',
		offlineMode: 'Study without internet connection',
	};

	const upgradeTier = tier === 'free' ? 'Pro' : 'Enterprise';

	return (
		<Card className="p-6 rounded-2xl text-center space-y-4">
			<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
				<HugeiconsIcon icon={LockIcon} className="w-6 h-6 text-primary" />
			</div>
			<div>
				<h3 className="font-bold text-lg">{featureLabels[feature]} Locked</h3>
				<p className="text-sm text-muted-foreground mt-1">{featureDescriptions[feature]}</p>
			</div>
			<div className="flex flex-col gap-2">
				<Button className="w-full rounded-full">
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-2" />
					Upgrade to {upgradeTier}
				</Button>
				<p className="text-xs text-muted-foreground">Starting at R99/month</p>
			</div>
		</Card>
	);
}
