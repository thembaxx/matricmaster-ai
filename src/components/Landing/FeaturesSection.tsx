'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { m, useReducedMotion } from 'framer-motion';
import { LANDING_FEATURES } from '@/content/landing';
import { DURATION, EASING, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

const FEATURES = LANDING_FEATURES;

export function FeaturesSection() {
	const shouldReduceMotion = useReducedMotion();

	return (
		<section className="py-24 lg:py-40 overflow-hidden">
			<m.div
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 40 }}
				whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
				className="max-w-6xl mx-auto px-6 mb-16"
			>
				<div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
					<div className="lg:flex-1">
						<p className="text-xs font-black tracking-[0.2em] text-primary uppercase mb-4">
							everything you need
						</p>
						<h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
							Your complete toolkit for <span className="text-primary">matric success</span>
						</h2>
					</div>
					<p className="text-lg text-muted-foreground max-w-md lg:text-right">
						Every tool you need to pass your NSC exams in one powerful platform.
					</p>
				</div>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="max-w-6xl mx-auto px-6"
			>
				<div className="grid grid-flow-dense grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
					{FEATURES.slice(0, 6).map((feature, index) => (
						<m.div
							key={feature.title}
							variants={STAGGER_ITEM}
							className={`group relative p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all duration-500 will-change-transform overflow-hidden ${
								index === 0 ? 'md:col-span-2 md:row-span-2' : ''
							}`}
							whileHover={shouldReduceMotion ? undefined : { y: -4 }}
						>
							<div
								className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${feature.color
									.replace('bg-', 'bg-')
									.replace('/10', '/5')}`}
							/>
							<div className="relative z-10">
								<div
									className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}
								>
									<HugeiconsIcon icon={feature.icon} className="w-6 h-6 text-background" />
								</div>
								<h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
									{feature.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>
							<div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500 rounded-full" />
						</m.div>
					))}
				</div>
			</m.div>

			<m.div
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
				whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.3 }}
				className="mt-12 text-center"
			>
				<span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 text-sm font-medium text-muted-foreground">
					+ {FEATURES.length - 6} more features waiting
				</span>
			</m.div>
		</section>
	);
}
