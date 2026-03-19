'use client';

import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { SubscriptionData } from './constants';
import { PlanCard } from './PlanCard';

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
					{plans.map((plan) => (
						<PlanCard
							key={plan.id}
							plan={plan}
							subscription={subscription}
							processing={processing}
							onSubscribe={handleSubscribe}
						/>
					))}
				</div>

				<div className="text-center mt-8 text-sm text-muted-foreground">
					<p>All plans include a 7-day free trial. Cancel anytime.</p>
					<p className="mt-2">Payments processed securely by Paystack</p>
				</div>
			</div>
		</div>
	);
}
