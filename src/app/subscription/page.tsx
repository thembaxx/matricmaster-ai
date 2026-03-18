'use client';

import {
	CheckmarkCircle02Icon,
	CrownIcon,
	Loading03Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
	id: string;
	name: string;
	description: string;
	priceZar: string;
	billingInterval: string;
	features: string[];
}

interface Subscription {
	planId: string;
	planName: string;
	status: string;
	currentPeriodEnd: Date;
}

interface SubscriptionData {
	plans: Plan[];
	subscription: Subscription | null;
}

export default function SubscriptionPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [processing, setProcessing] = useState<string | null>(null);

	const success = searchParams.get('success');
	const cancelled = searchParams.get('cancelled');
	const error = searchParams.get('error');

	useEffect(() => {
		if (success === 'true') {
			toast.success('Payment successful! Welcome to your new plan.');
			router.replace('/subscription');
		} else if (cancelled === 'true') {
			toast.info('Payment cancelled. You can try again anytime.');
			router.replace('/subscription');
		} else if (error) {
			toast.error('Payment failed. Please try again.');
			router.replace('/subscription');
		}
	}, [success, cancelled, error, router]);

	const { data: subscriptionData, isLoading } = useQuery<SubscriptionData>({
		queryKey: ['subscription-plans'],
		queryFn: async () => {
			const response = await fetch('/api/subscription/plans', {
				headers: { 'Content-Type': 'application/json' },
			});
			const data = await response.json();
			return data as SubscriptionData;
		},
	});

	const plans = subscriptionData?.plans ?? [];
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
				window.location.href = data.authorizationUrl;
			} else {
				toast.error(data.error || 'Failed to start payment');
			}
		} catch (_err) {
			toast.error('Payment failed. Please try again.');
		} finally {
			setProcessing(null);
		}
	};

	const getButtonText = (planId: string, currentPlanId: string | undefined) => {
		if (processing === planId) return 'Processing...';
		if (currentPlanId === planId) return 'Current Plan';
		if (!subscription && planId === 'free') return 'Get Started';
		if (!subscription) return 'Subscribe';
		if (subscription.planId === planId) return 'Current Plan';
		return 'Upgrade';
	};

	const isCurrentPlan = (planId: string) => subscription?.planId === planId;

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading plans...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-5xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Unlock your full potential with our premium study tools. Choose the plan that works best
						for you.
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{plans.map((plan) => {
						const isPro = plan.id === 'pro';
						const isPremium = plan.id === 'premium';
						const isCurrent = isCurrentPlan(plan.id);

						return (
							<Card
								key={plan.id}
								className={`relative overflow-hidden transition-all duration-300 ${
									isPro
										? 'border-primary shadow-lg scale-105 z-10'
										: isPremium
											? 'border-amber-500 shadow-lg'
											: ''
								} ${isCurrent ? 'ring-2 ring-primary' : ''}`}
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

								<CardHeader className={`pb-4 ${isPro ? 'pt-8' : ''}`}>
									<CardTitle className="flex items-center gap-2">
										{isPro && (
											<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
										)}
										{isPremium && (
											<HugeiconsIcon icon={CrownIcon} className="w-5 h-5 text-amber-500" />
										)}
										{plan.name}
									</CardTitle>
									<CardDescription>{plan.description}</CardDescription>
								</CardHeader>

								<CardContent>
									<div className="mb-6">
										<span className="text-4xl font-bold">R{plan.priceZar}</span>
										<span className="text-muted-foreground">/{plan.billingInterval}</span>
									</div>

									<ul className="space-y-3 mb-6">
										{plan.features?.map((feature, idx) => (
											<li key={idx} className="flex items-start gap-2">
												<HugeiconsIcon
													icon={CheckmarkCircle02Icon}
													className={`w-5 h-5 shrink-0 mt-0.5 ${
														isPro ? 'text-primary' : isPremium ? 'text-amber-500' : 'text-green-500'
													}`}
												/>
												<span className="text-sm">{feature}</span>
											</li>
										))}
									</ul>

									<Button
										className={`w-full ${
											isPro
												? 'bg-primary hover:bg-primary/90'
												: isPremium
													? 'bg-amber-500 hover:bg-amber-600 text-white'
													: ''
										}`}
										variant={isCurrent ? 'outline' : isPro || isPremium ? 'default' : 'outline'}
										disabled={isCurrent || processing !== null}
										onClick={() => !isCurrent && handleSubscribe(plan.id)}
									>
										{processing === plan.id ? (
											<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
										) : null}
										{getButtonText(plan.id, subscription?.planId)}
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<div className="text-center mt-8 text-sm text-muted-foreground">
					<p>All plans include a 7-day free trial. Cancel anytime.</p>
					<p className="mt-2">Payments processed securely by Paystack</p>
				</div>
			</div>
		</div>
	);
}
