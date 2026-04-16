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
				className="max-w-5xl mx-auto px-4 mb-16"
			>
				<div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
					<div className="lg:flex-1">
						<p className="text-xs font-black tracking-[0.2em] text-primary uppercase mb-4">
							pricing
						</p>
						<h2 className="heading-2 leading-tight">
							Simple, student-friendly
							<br />
							<span className="text-primary">pricing</span>
						</h2>
					</div>
					<p className="text-lg text-muted-foreground max-w-md">
						Start free. Upgrade when you're ready.
					</p>
				</div>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="max-w-5xl mx-auto px-4"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Free Plan */}
					<div className="relative rounded-[2rem] border border-border/50 bg-card p-8 transition-all duration-300 hover:shadow-tiimo">
						<div className="mb-8">
							<span className="inline-block text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-4">
								free
							</span>
							<p className="text-5xl font-black tracking-tighter font-numeric">R0</p>
							<p className="text-sm text-muted-foreground mt-1">per month</p>
						</div>

						<ul className="space-y-4 mb-8">
							{FREE_FEATURES.map((feature, index) => (
								<li key={index} className="flex items-center gap-3">
									<HugeiconsIcon
										icon={CheckmarkSquare01Icon}
										className="w-4 h-4 text-muted-foreground flex-shrink-0"
									/>
									<span className="text-sm text-muted-foreground">{feature}</span>
								</li>
							))}
						</ul>

						<Button
							variant="outline"
							className="w-full h-12 rounded-xl text-sm font-bold"
							onClick={() => router.push('/register')}
						>
							Get Started
						</Button>
					</div>

					{/* Pro Plan */}
					<div className="relative rounded-[2rem] bg-foreground text-background p-8 overflow-hidden">
						<div className="absolute inset-0 opacity-10">
							<div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[80px]" />
							<div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full blur-[60px]" />
						</div>

						<div className="relative">
							<span className="inline-block text-[10px] font-black tracking-[0.2em] text-primary/60 uppercase mb-4">
								pro
							</span>
							<div className="mb-8">
								<p className="text-5xl font-black tracking-tighter font-numeric text-background">
									R99
								</p>
								<p className="text-sm text-background/60 mt-1">per month</p>
							</div>

							<ul className="space-y-4 mb-8">
								{PRO_FEATURES.map((feature, index) => (
									<li key={index} className="flex items-center gap-3">
										<HugeiconsIcon
											icon={CheckmarkSquare01Icon}
											className="w-4 h-4 text-primary flex-shrink-0"
										/>
										<span className="text-sm text-background/80">{feature}</span>
									</li>
								))}
							</ul>

							<Button
								className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
								onClick={() => router.push('/register?plan=pro')}
							>
								Go Pro
								<span className="ml-2">→</span>
							</Button>
						</div>
					</div>
				</div>
			</m.div>
		</section>
	);
}
