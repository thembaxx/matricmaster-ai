import {
	CheckmarkCircle02Icon,
	CrownIcon,
	Loading03Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Plan, Subscription } from './constants';

export function PlanCard({
	plan,
	subscription,
	processing,
	onSubscribe,
}: {
	plan: Plan;
	subscription: Subscription | null;
	processing: string | null;
	onSubscribe: (planId: string) => void;
}) {
	const isPro = plan.id === 'pro';
	const isPremium = plan.id === 'premium';
	const isCurrent = subscription?.planId === plan.id;

	const getButtonText = () => {
		if (processing === plan.id) return 'Processing...';
		if (isCurrent) return 'Current Plan';
		if (!subscription && plan.id === 'free') return 'Get Started';
		if (!subscription) return 'Subscribe';
		return 'Upgrade';
	};

	return (
		<Card
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
					{isPro && <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />}
					{isPremium && <HugeiconsIcon icon={CrownIcon} className="w-5 h-5 text-amber-500" />}
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
					{plan.features?.map((feature) => (
						<li key={feature} className="flex items-start gap-2">
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
					onClick={() => !isCurrent && onSubscribe(plan.id)}
				>
					{processing === plan.id ? (
						<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
					) : null}
					{getButtonText()}
				</Button>
			</CardContent>
		</Card>
	);
}
