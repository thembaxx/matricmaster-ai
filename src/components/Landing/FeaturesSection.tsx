'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { LANDING_FEATURES } from '@/content/landing';

const FEATURES = LANDING_FEATURES;

export function FeaturesSection() {
	const shouldReduceMotion = useReducedMotion();
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

	return (
		<section ref={sectionRef} className="py-32 lg:py-48 overflow-hidden">
			<m.div
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 60 }}
				whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-150px' }}
				transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				className="max-w-7xl mx-auto px-6 mb-20"
			>
				<div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-20">
					<div className="lg:flex-1">
						<p className="text-xs font-black tracking-[0.25em] text-primary uppercase mb-5">
							everything you need
						</p>
						<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
							Your complete <br />
							toolkit for <span className="text-primary">matric success</span>
						</h2>
					</div>
					<p className="text-lg text-muted-foreground max-w-sm lg:text-right leading-relaxed">
						Every tool you need to pass your NSC exams in one powerful platform.
					</p>
				</div>
			</m.div>

			<m.div style={{ y }} className="max-w-7xl mx-auto px-6">
				<div className="grid grid-flow-dense grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{FEATURES.slice(0, 6).map((feature, index) => (
						<m.div
							key={feature.title}
							initial={shouldReduceMotion ? undefined : { opacity: 0, y: 40 }}
							whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-50px' }}
							transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
							className={`group relative p-8 rounded-3xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/40 transition-all duration-500 overflow-hidden ${
								index === 0 ? 'md:col-span-2 md:row-span-2' : ''
							}`}
						>
							<div
								className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${feature.color.replace('bg-', 'bg-').replace('/10', '/5')}`}
							/>
							<div className="relative z-10">
								<div
									className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}
								>
									<HugeiconsIcon icon={feature.icon} className="w-7 h-7 text-background" />
								</div>
								<h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
									{feature.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
							</div>
							<div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-transparent w-0 group-hover:w-full transition-all duration-700 rounded-full" />
						</m.div>
					))}
				</div>
			</m.div>

			<m.div
				initial={shouldReduceMotion ? undefined : { opacity: 0 }}
				whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.4 }}
				className="mt-14 text-center"
			>
				<span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-muted/40 text-sm font-medium text-muted-foreground">
					+ {FEATURES.length - 6} more features
				</span>
			</m.div>
		</section>
	);
}
