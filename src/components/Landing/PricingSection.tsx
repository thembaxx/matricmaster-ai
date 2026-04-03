'use client';

import { CheckmarkSquare01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const FREE_FEATURES = ['10 questions per day', 'Basic help', 'Progress tracking'];

const PRO_FEATURES = [
	'Unlimited questions',
	'Priority responses',
	'Essay feedback',
	'All subjects access',
];

export function PricingSection() {
	const router = useRouter();

	return (
		<section className="py-20 lg:py-32">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6 }}
				className="text-center mb-16"
			>
				<h2 className="heading-2 mb-4">Simple, student-friendly pricing</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Start free. Upgrade when you're ready.
				</p>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="max-w-4xl mx-auto px-4"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="relative rounded-[var(--radius-2xl)] border border-border bg-card p-8 transition-all duration-300">
						<div className="mb-6">
							<h3 className="text-2xl font-semibold mb-2">Free</h3>
							<p className="text-4xl font-bold font-mono">R0/month</p>
						</div>

						<ul className="space-y-4 mb-8">
							{FREE_FEATURES.map((feature, index) => (
								<li key={index} className="flex items-center gap-3">
									<HugeiconsIcon
										icon={CheckmarkSquare01Icon}
										className="w-5 h-5 text-primary flex-shrink-0"
									/>
									<span className="text-muted-foreground">{feature}</span>
								</li>
							))}
						</ul>

						<Button
							variant="outline"
							className="w-full h-12 rounded-[var(--radius-lg)] text-base font-semibold"
							onClick={() => router.push('/sign-up')}
						>
							Get Started
						</Button>
					</div>

					<div className="relative rounded-[var(--radius-2xl)] border-2 border-primary/20 bg-card p-8 transition-all duration-300 scale-100 shadow-xl">
						<div className="absolute -top-4 left-1/2 -translate-x-1/2">
							<span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground shadow-sm">
								Most Popular
							</span>
						</div>

						<div className="mb-6">
							<h3 className="text-2xl font-semibold mb-2">Pro</h3>
							<p className="text-4xl font-bold font-mono">R99/month</p>
						</div>

						<ul className="space-y-4 mb-8">
							{PRO_FEATURES.map((feature, index) => (
								<li key={index} className="flex items-center gap-3">
									<HugeiconsIcon
										icon={CheckmarkSquare01Icon}
										className="w-5 h-5 text-primary flex-shrink-0"
									/>
									<span className="text-muted-foreground">{feature}</span>
								</li>
							))}
						</ul>

						<Button
							className="w-full h-12 rounded-[var(--radius-lg)] text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
							onClick={() => router.push('/sign-up?plan=pro')}
						>
							Go Pro →
						</Button>
					</div>
				</div>
			</m.div>
		</section>
	);
}
