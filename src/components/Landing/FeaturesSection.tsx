'use client';

import type { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { LANDING_FEATURES } from '@/data/landing';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

type IconSvg = typeof SparklesIcon;

const FEATURES = LANDING_FEATURES;

interface Feature {
	title: string;
	description: string;
	icon: IconSvg;
	color: string;
}

export function FeaturesSection() {
	return (
		<section className="py-20 lg:py-32">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6 }}
				className="text-center mb-16"
			>
				<h2 className="heading-2 mb-4 text-pretty">
					Everything you need to
					<span className="text-tiimo-lavender"> pass</span>
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
					Study tools built specifically for the NSC Grade 12 exams.
				</p>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				{FEATURES.map((feature: Feature) => (
					<m.div
						key={feature.title}
						variants={STAGGER_ITEM}
						className="tiimo-card group p-6 lg:p-8 min-h-[180px] will-change-transform"
					>
						<div
							className={`w-12 h-12 lg:w-14 lg:h-14 rounded-[var(--radius-lg)] ${feature.color} flex items-center justify-center mb-4 lg:mb-6`}
						>
							<HugeiconsIcon icon={feature.icon} className="w-6 h-6 lg:w-7 lg:h-7" />
						</div>
						<h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">{feature.title}</h3>
						<p className="text-sm lg:text-base text-muted-foreground leading-relaxed line-clamp-2 lg:line-clamp-3">
							{feature.description}
						</p>
					</m.div>
				))}
			</m.div>
		</section>
	);
}
