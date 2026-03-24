'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { LANDING_FEATURES } from '@/data/landing';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

const FEATURES = LANDING_FEATURES;

const FEATURE_VARIANTS = {
	hero: 'md:col-span-2 lg:col-span-2 p-8 lg:p-10',
	wide: 'md:col-span-2 p-6 lg:p-8',
	standard: 'p-6 lg:p-8',
};

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
					your ticket to
					<span className="text-tiimo-lavender"> matric success</span>
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
					every tool you need to pass your nsc exams in one place.
				</p>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
			>
				<m.div
					key={FEATURES[0].title}
					variants={STAGGER_ITEM}
					className={`tiimo-card group ${FEATURE_VARIANTS.hero} will-change-transform`}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-14 h-14 lg:w-16 lg:h-16 rounded-[var(--radius-xl)] ${FEATURES[0].color} flex items-center justify-center mb-6`}
						>
							<HugeiconsIcon icon={FEATURES[0].icon} className="w-8 h-8" />
						</div>
						<h3 className="text-2xl lg:text-3xl font-bold mb-3">
							{FEATURES[0].title.toLowerCase()}
						</h3>
						<p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-md">
							{FEATURES[0].description.toLowerCase()}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[1].title}
					variants={STAGGER_ITEM}
					className={`tiimo-card group ${FEATURE_VARIANTS.standard} will-change-transform`}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-[var(--radius-lg)] ${FEATURES[1].color} flex items-center justify-center mb-4`}
						>
							<HugeiconsIcon icon={FEATURES[1].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-lg font-bold mb-2">{FEATURES[1].title.toLowerCase()}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{FEATURES[1].description.toLowerCase()}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[2].title}
					variants={STAGGER_ITEM}
					className={`tiimo-card group ${FEATURE_VARIANTS.standard} will-change-transform`}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-[var(--radius-lg)] ${FEATURES[2].color} flex items-center justify-center mb-4`}
						>
							<HugeiconsIcon icon={FEATURES[2].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-lg font-bold mb-2">{FEATURES[2].title.toLowerCase()}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{FEATURES[2].description.toLowerCase()}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[3].title}
					variants={STAGGER_ITEM}
					className={`tiimo-card group ${FEATURE_VARIANTS.standard} will-change-transform`}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-[var(--radius-lg)] ${FEATURES[3].color} flex items-center justify-center mb-4`}
						>
							<HugeiconsIcon icon={FEATURES[3].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-lg font-bold mb-2">{FEATURES[3].title.toLowerCase()}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{FEATURES[3].description.toLowerCase()}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[4].title}
					variants={STAGGER_ITEM}
					className={`tiimo-card group ${FEATURE_VARIANTS.wide} will-change-transform`}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-[var(--radius-lg)] ${FEATURES[4].color} flex items-center justify-center mb-4`}
						>
							<HugeiconsIcon icon={FEATURES[4].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-lg font-bold mb-2">{FEATURES[4].title.toLowerCase()}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{FEATURES[4].description.toLowerCase()}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[5].title}
					variants={STAGGER_ITEM}
					className={`tiimo-card group ${FEATURE_VARIANTS.standard} will-change-transform`}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-[var(--radius-lg)] ${FEATURES[5].color} flex items-center justify-center mb-4`}
						>
							<HugeiconsIcon icon={FEATURES[5].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-lg font-bold mb-2">{FEATURES[5].title.toLowerCase()}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{FEATURES[5].description.toLowerCase()}
						</p>
					</div>
				</m.div>
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
