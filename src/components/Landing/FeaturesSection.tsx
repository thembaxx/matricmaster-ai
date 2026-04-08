'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { LANDING_FEATURES } from '@/content/landing';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

const FEATURES = LANDING_FEATURES;

export function FeaturesSection() {
	return (
		<section className="py-20 lg:py-32 bg-slate-50">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6 }}
				className="text-center mb-16"
			>
				<h2 className="heading-2 mb-4">
					Your ticket to <span className="text-tiimo-lavender">matric success</span>
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Every tool you need to pass your NSC exams in one place.
				</p>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4"
			>
				{FEATURES.slice(0, 6).map((feature) => (
					<m.div
						key={feature.title}
						variants={STAGGER_ITEM}
						className="tiimo-card group p-8 will-change-transform"
						whileHover={{ y: -4 }}
					>
						<div className="flex flex-col h-full">
							<div
								className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mb-6`}
							>
								<HugeiconsIcon icon={feature.icon} className="w-6 h-6" />
							</div>
							<h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
							<p className="text-base text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</div>
					</m.div>
				))}
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.3 }}
				className="mt-12 text-center"
			>
				<p className="text-muted-foreground">+ {FEATURES.length - 6} more features</p>
			</m.div>
		</section>
	);
}
