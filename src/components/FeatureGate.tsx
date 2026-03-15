'use client';

import { CrownIcon, LockIcon, SparklesIcon } from '@hugeicons/core-free-icons';
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

const featureData: Record<string, { label: string; description: string; iconGradient: string }> = {
	unlimitedQuizzes: {
		label: 'Unlimited Quizzes',
		description: 'Take unlimited quizzes to practice all you want',
		iconGradient: 'from-yellow-400 to-orange-500',
	},
	aiExplanations: {
		label: 'AI Explanations',
		description: 'Get instant AI-powered explanations for any question',
		iconGradient: 'from-purple-400 to-pink-500',
	},
	voiceTutor: {
		label: 'Voice Tutor',
		description: 'Talk to your AI tutor using voice',
		iconGradient: 'from-blue-400 to-indigo-500',
	},
	analytics: {
		label: 'Advanced Analytics',
		description: 'See detailed insights into your study progress',
		iconGradient: 'from-emerald-400 to-teal-500',
	},
	prioritySupport: {
		label: 'Priority Support',
		description: 'Get faster responses from our support team',
		iconGradient: 'from-rose-400 to-red-500',
	},
	offlineMode: {
		label: 'Offline Mode',
		description: 'Study without internet connection',
		iconGradient: 'from-cyan-400 to-blue-500',
	},
};

export function UpgradePrompt({ feature, tier }: UpgradePromptProps) {
	const data = featureData[feature];
	const upgradeTier = tier === 'free' ? 'Pro' : 'Enterprise';

	return (
		<Card className="p-8 rounded-[2rem] text-center space-y-6 border-0 shadow-tiimo-lg overflow-hidden relative">
			<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-400 to-primary" />

			<div className="relative">
				<div
					className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${data.iconGradient} flex items-center justify-center mx-auto shadow-lg`}
				>
					<HugeiconsIcon icon={LockIcon} className="w-8 h-8 text-white" />
				</div>
			</div>

			<div className="space-y-2">
				<h3 className="font-display font-bold text-xl text-foreground">{data.label}</h3>
				<p className="text-sm text-muted-foreground max-w-sm mx-auto">{data.description}</p>
			</div>

			<div className="space-y-3">
				<Button className="w-full rounded-full h-12 font-semibold text-base bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600">
					<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 mr-2" />
					Upgrade to {upgradeTier}
				</Button>
				<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<HugeiconsIcon icon={CrownIcon} className="w-4 h-4 text-yellow-500" />
					<span>Starting at R99/month</span>
				</div>
			</div>
		</Card>
	);
}
