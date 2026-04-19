'use client';

import { Camera01Icon, ChartIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

const STEPS = [
	{
		icon: Camera01Icon,
		title: 'Upload question',
		description: 'snap a photo or type any past paper question',
		color: 'bg-primary/10 text-primary',
	},
	{
		icon: SparklesIcon,
		title: 'Get AI help',
		description: 'our AI explains the solution step-by-step',
		color: 'bg-secondary/10 text-secondary',
	},
	{
		icon: ChartIcon,
		title: 'Track progress',
		description: "see which topics you've mastered and what needs work",
		color: 'bg-primary/10 text-primary',
	},
];

export function HowItWorksSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

	return (
		<section ref={sectionRef} className="py-32 lg:py-48 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

			<m.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				className="text-center mb-20 relative z-10"
			>
				<p className="text-xs font-black tracking-[0.25em] text-primary uppercase mb-5">
					how it works
				</p>
				<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
					Three steps to <span className="text-primary">success</span>
				</h2>
				<p className="text-lg text-muted-foreground max-w-xl mx-auto">
					Three simple steps to boost your matric results
				</p>
			</m.div>

			<m.div style={{ y }} className="max-w-6xl mx-auto px-6 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
					{STEPS.map((step, index) => (
						<m.div
							key={step.title}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-50px' }}
							transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
							className="relative flex flex-col items-center text-center group"
						>
							<div className="relative mb-8">
								<div
									className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
								>
									<HugeiconsIcon icon={step.icon} className="w-9 h-9" />
								</div>
								<div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background text-sm font-semibold flex items-center justify-center">
									{index + 1}
								</div>
							</div>
							<h3 className="text-xl font-semibold mb-3">{step.title}</h3>
							<p className="text-muted-foreground leading-relaxed max-w-[260px]">
								{step.description}
							</p>
							{index < STEPS.length - 1 && (
								<div className="hidden md:block absolute top-12 left-[55%] w-[90%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
							)}
						</m.div>
					))}
				</div>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.4 }}
				className="mt-16 text-center relative z-10"
			>
				<Button size="lg" className="px-10 h-14 rounded-full text-base font-semibold">
					Try It Free
				</Button>
			</m.div>
		</section>
	);
}
