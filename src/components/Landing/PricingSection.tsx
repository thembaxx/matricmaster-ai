'use client';

import { CheckmarkSquare01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m, useScroll, useTransform } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
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
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

	return (
		<section ref={sectionRef} className="py-32 lg:py-48 relative overflow-hidden">
			<m.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				className="max-w-6xl mx-auto px-6 mb-20"
			>
				<div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-20">
					<div className="lg:flex-1">
						<p className="text-xs font-black tracking-[0.25em] text-primary uppercase mb-5">
							pricing
						</p>
						<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
							Simple, student-friendly
							<br />
							<span className="text-primary">pricing</span>
						</h2>
					</div>
					<p className="text-lg text-muted-foreground max-w-sm">
						Start free. Upgrade when you're ready.
					</p>
				</div>
			</m.div>

			<m.div style={{ y }} className="max-w-6xl mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
					{/* Free Plan */}
					<m.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-50px' }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="relative rounded-[2.5rem] border border-border/40 bg-muted/20 p-10 transition-all duration-500 hover:border-border/80 hover:shadow-xl"
					>
						<div className="mb-10">
							<span className="inline-block text-[10px] font-black tracking-[0.25em] text-muted-foreground uppercase mb-4">
								free
							</span>
							<p className="text-6xl font-black tracking-tighter font-numeric">R0</p>
							<p className="text-muted-foreground mt-2">per month</p>
						</div>

						<ul className="space-y-5 mb-10">
							{FREE_FEATURES.map((feature, index) => (
								<li key={index} className="flex items-center gap-4">
									<HugeiconsIcon
										icon={CheckmarkSquare01Icon}
										className="w-5 h-5 text-muted-foreground flex-shrink-0"
									/>
									<span className="text-muted-foreground">{feature}</span>
								</li>
							))}
						</ul>

						<Button
							variant="outline"
							className="w-full h-14 rounded-full text-base font-semibold"
							onClick={() => router.push('/register')}
						>
							Get Started
						</Button>
					</m.div>

					{/* Pro Plan */}
					<m.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-50px' }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="relative rounded-[2.5rem] bg-foreground text-background p-10 overflow-hidden"
					>
						<div className="absolute inset-0 opacity-15">
							<div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px]" />
							<div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[80px]" />
						</div>

						<div className="relative">
							<span className="inline-block text-[10px] font-black tracking-[0.25em] text-primary/70 uppercase mb-4">
								pro
							</span>
							<div className="mb-10">
								<p className="text-6xl font-black tracking-tighter font-numeric text-background">
									R99
								</p>
								<p className="text-background/60 mt-2">per month</p>
							</div>

							<ul className="space-y-5 mb-10">
								{PRO_FEATURES.map((feature, index) => (
									<li key={index} className="flex items-center gap-4">
										<HugeiconsIcon
											icon={CheckmarkSquare01Icon}
											className="w-5 h-5 text-primary flex-shrink-0"
										/>
										<span className="text-background/85">{feature}</span>
									</li>
								))}
							</ul>

							<Button
								className="w-full h-14 rounded-full text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
								onClick={() => router.push('/register?plan=pro')}
							>
								Go Pro
							</Button>
						</div>
					</m.div>
				</div>
			</m.div>
		</section>
	);
}
