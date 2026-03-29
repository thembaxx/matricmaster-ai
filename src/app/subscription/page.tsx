'use client';
/* eslint-disable no-restricted-syntax */

import {
	CheckmarkCircle02Icon,
	CrownIcon,
	Loading03Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { redirect, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useCurrentTier } from '@/hooks/useFeatureAccess';
import { PLANS } from '@/lib/subscriptionManager';

const FEATURE_LIST = [
	{ name: 'Quizzes per day', free: '10', basic: '30', premium: 'Unlimited', pro: 'Unlimited' },
	{ name: 'AI tutor messages', free: '5', basic: '20', premium: 'Unlimited', pro: 'Unlimited' },
	{ name: 'Voice AI Tutor', free: false, basic: false, premium: true, pro: true },
	{ name: 'Focus Rooms', free: false, basic: false, premium: true, pro: true },
	{ name: 'Past Papers', free: false, basic: false, premium: true, pro: true },
	{ name: 'Live Tutoring', free: false, basic: '2/month', premium: '5/month', pro: 'Unlimited' },
	{ name: 'Video Calls', free: false, basic: false, premium: true, pro: true },
	{ name: 'Group Challenges', free: false, basic: false, premium: true, pro: true },
	{ name: 'Flashcard Generation', free: false, basic: true, premium: true, pro: true },
	{ name: 'Advanced Analytics', free: false, basic: true, premium: true, pro: true },
	{ name: 'Priority Support', free: false, basic: false, premium: false, pro: true },
	{ name: 'Custom Study Paths', free: false, basic: false, premium: false, pro: true },
];

function SubscriptionPageContent() {
	const searchParams = useSearchParams();
	const [processing, setProcessing] = useState<string | null>(null);
	const [previewFeature, setPreviewFeature] = useState<string | null>(null);

	const success = searchParams.get('success');
	const cancelled = searchParams.get('cancelled');
	const error = searchParams.get('error');
	const previewParam = searchParams.get('preview');

	const { tier, isLoading: tierLoading } = useCurrentTier();

	useEffect(() => {
		if (previewParam) {
			setPreviewFeature(previewParam);
		}
	}, [previewParam]);

	useEffect(() => {
		if (success === 'true') {
			toast.success('Payment successful! Welcome to your new plan.');
			redirect('/subscription');
		} else if (cancelled === 'true') {
			toast.info('Payment cancelled. You can try again anytime.');
			redirect('/subscription');
		} else if (error) {
			toast.error('Payment failed. Please try again.');
			redirect('/subscription');
		}
	}, [success, cancelled, error]);

	const { data: subscriptionData, isLoading } = useQuery({
		queryKey: ['subscription-plans'],
		queryFn: async () => {
			const response = await fetch('/api/subscription/plans', {
				headers: { 'Content-Type': 'application/json' },
			});
			const data = await response.json();
			return data;
		},
	});

	const { data: analyticsData } = useQuery({
		queryKey: ['subscription-analytics'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/subscription/analytics');
				if (response.ok) {
					return response.json();
				}
				return null;
			} catch {
				return null;
			}
		},
		enabled: !!subscriptionData?.subscription,
	});

	const plans = PLANS;
	const subscription = subscriptionData?.subscription ?? null;

	const handleSubscribe = async (planId: string) => {
		setProcessing(planId);
		try {
			const response = await fetch('/api/subscription/payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ planId }),
			});

			const data = await response.json();

			if (data.authorizationUrl) {
				setProcessing(null);
				redirect(data.authorizationUrl);
				return;
			}
			toast.error(data.error || 'Failed to start payment');
		} catch {
			toast.error('Payment failed. Please try again.');
		}
		setProcessing(null);
	};

	const handleTryFeature = (_featureId: string) => {
		toast.success('Feature unlocked for this session!');
		setPreviewFeature(null);
	};

	if (isLoading || tierLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading plans...</p>
				</div>
			</div>
		);
	}

	const currentTierIndex = plans.findIndex((p) => p.tier === tier);

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-5xl mx-auto space-y-12">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Unlock your full potential with our premium study tools. Choose the plan that works best
						for you.
					</p>
				</div>

				{currentTierIndex > 0 && (
					<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
						<p className="text-sm">
							<span className="text-primary font-medium">Your current plan: </span>
							<span className="capitalize font-semibold">{tier}</span>
						</p>
					</div>
				)}

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
					{plans.map((plan, index) => {
						const isPro = plan.id === 'pro';
						const isPremium = plan.id === 'premium';
						const isCurrent = subscription?.planId === plan.id;
						const isDowngrade = index < currentTierIndex;

						return (
							<Card
								key={plan.id}
								className={`relative overflow-hidden transition-all duration-300 ${
									isPro ? 'border-primary shadow-lg' : ''
								} ${isCurrent ? 'ring-2 ring-primary' : ''} ${isDowngrade ? 'opacity-75' : ''}`}
							>
								{isPro && (
									<div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-1 text-sm font-medium">
										Most Popular
									</div>
								)}
								{isPremium && (
									<div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm font-medium">
										Best Value
									</div>
								)}
								{isCurrent && (
									<div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-1 text-sm font-medium">
										Current Plan
									</div>
								)}

								<CardHeader className={`pb-4 ${isPro || isCurrent ? 'pt-8' : ''}`}>
									<CardTitle className="flex items-center gap-2">
										{isPro && (
											<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
										)}
										{isPremium && (
											<HugeiconsIcon icon={CrownIcon} className="w-5 h-5 text-amber-500" />
										)}
										{plan.name}
									</CardTitle>
									<CardDescription className="font-mono">
										R{plan.priceZar}/{plan.billingInterval}
									</CardDescription>
								</CardHeader>

								<CardContent>
									<ul className="space-y-2 mb-6">
										{plan.features.slice(0, 5).map((feature) => (
											<li key={feature} className="flex items-start gap-2 text-sm">
												<HugeiconsIcon
													icon={CheckmarkCircle02Icon}
													className="w-4 h-4 shrink-0 mt-0.5 text-green-500"
												/>
												<span>{feature}</span>
											</li>
										))}
									</ul>

									<Button
										className={`w-full ${isPro ? 'bg-primary hover:bg-primary/90' : ''}`}
										variant={isCurrent ? 'outline' : isPro ? 'default' : 'outline'}
										disabled={isCurrent || processing !== null}
										onClick={() => !isCurrent && handleSubscribe(plan.id)}
									>
										{processing === plan.id ? (
											<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
										) : null}
										{isCurrent ? 'Current Plan' : isDowngrade ? 'Downgrade' : 'Subscribe'}
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<div className="bg-muted/50 rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Feature Comparison</h2>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[200px]">Feature</TableHead>
									<TableHead className="text-center">Free</TableHead>
									<TableHead className="text-center">Basic</TableHead>
									<TableHead className="text-center">Premium</TableHead>
									<TableHead className="text-center">Pro</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{FEATURE_LIST.map((feature) => (
									<TableRow key={feature.name}>
										<TableCell className="font-medium">{feature.name}</TableCell>
										<TableCell className="text-center">
											{typeof feature.free === 'boolean' ? (
												feature.free ? (
													<HugeiconsIcon
														icon={CheckmarkCircle02Icon}
														className="w-5 h-5 text-green-500 mx-auto"
													/>
												) : (
													<span className="text-muted-foreground">—</span>
												)
											) : (
												<span className="font-mono text-sm">{feature.free}</span>
											)}
										</TableCell>
										<TableCell className="text-center">
											{typeof feature.basic === 'boolean' ? (
												feature.basic ? (
													<HugeiconsIcon
														icon={CheckmarkCircle02Icon}
														className="w-5 h-5 text-green-500 mx-auto"
													/>
												) : (
													<span className="text-muted-foreground">—</span>
												)
											) : (
												<span className="font-mono text-sm">{feature.basic}</span>
											)}
										</TableCell>
										<TableCell className="text-center bg-primary/5">
											{typeof feature.premium === 'boolean' ? (
												feature.premium ? (
													<HugeiconsIcon
														icon={CheckmarkCircle02Icon}
														className="w-5 h-5 text-green-500 mx-auto"
													/>
												) : (
													<span className="text-muted-foreground">—</span>
												)
											) : (
												<span className="font-mono text-sm">{feature.premium}</span>
											)}
										</TableCell>
										<TableCell className="text-center">
											{typeof feature.pro === 'boolean' ? (
												feature.pro ? (
													<HugeiconsIcon
														icon={CheckmarkCircle02Icon}
														className="w-5 h-5 text-green-500 mx-auto"
													/>
												) : (
													<span className="text-muted-foreground">—</span>
												)
											) : (
												<span className="font-mono text-sm">{feature.pro}</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				{analyticsData?.featuresUsedMost && analyticsData.featuresUsedMost.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Features You Use Most</CardTitle>
							<CardDescription>
								Based on your recent activity, you might benefit from:
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{analyticsData.featuresUsedMost
									.slice(0, 3)
									.map((feature: { featureName: string; usageCount: number }, index: number) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
										>
											<div>
												<p className="font-medium">{feature.featureName}</p>
												<p className="text-sm text-muted-foreground">
													Used {feature.usageCount} times this month
												</p>
											</div>
											{(feature.featureName === 'AI Tutor' ||
												feature.featureName === 'Study Sessions') && (
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														handleSubscribe(
															feature.featureName === 'AI Tutor' ? 'basic' : 'premium'
														)
													}
												>
													Upgrade
												</Button>
											)}
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				)}

				{previewFeature && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<Card className="max-w-md w-full">
							<CardHeader>
								<CardTitle>Try Premium Feature</CardTitle>
								<CardDescription>You can try this feature once for free!</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									This will give you one-time access to preview the feature before upgrading.
								</p>
								<div className="flex gap-3">
									<Button className="flex-1" onClick={() => handleTryFeature(previewFeature)}>
										Try Now
									</Button>
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => setPreviewFeature(null)}
									>
										Cancel
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				<div className="bg-muted/30 rounded-lg p-6 text-center">
					<h3 className="font-semibold mb-2">Grace Period</h3>
					<p className="text-sm text-muted-foreground">
						After your subscription expires, you'll have a 3-day grace period to renew without
						losing access to premium features.
					</p>
				</div>

				<div className="text-center text-sm text-muted-foreground">
					<p>All plans include a 7-day free trial. Cancel anytime.</p>
					<p className="mt-2">Payments processed securely by Paystack</p>
				</div>
			</div>
		</div>
	);
}

function SubscriptionPageSkeleton() {
	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-5xl mx-auto">
				<div className="text-center mb-12 space-y-4">
					<div className="h-10 bg-muted rounded w-1/3 mx-auto animate-pulse" />
					<div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse" />
				</div>
				<div className="grid md:grid-cols-4 gap-6">
					{[1, 2, 3, 4].map((item) => (
						<div
							key={`subscription-page-skeleton-${item}`}
							className="h-80 bg-muted rounded-lg animate-pulse"
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default function SubscriptionPage() {
	return (
		<Suspense fallback={<SubscriptionPageSkeleton />}>
			<SubscriptionPageContent />
		</Suspense>
	);
}
