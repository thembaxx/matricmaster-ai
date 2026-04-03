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
					Your Ticket to <span className="text-tiimo-lavender">Matric Success</span>
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
				<m.div
					key={FEATURES[0].title}
					variants={STAGGER_ITEM}
					className="tiimo-card group p-8 will-change-transform"
					whileHover={{ y: -4 }}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-full ${FEATURES[0].color} flex items-center justify-center mb-6`}
						>
							<HugeiconsIcon icon={FEATURES[0].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-xl font-semibold mb-3">{FEATURES[0].title}</h3>
						<p className="text-base text-muted-foreground leading-relaxed">
							{FEATURES[0].description}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[1].title}
					variants={STAGGER_ITEM}
					className="tiimo-card group p-8 will-change-transform"
					whileHover={{ y: -4 }}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-full ${FEATURES[1].color} flex items-center justify-center mb-6`}
						>
							<HugeiconsIcon icon={FEATURES[1].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-xl font-semibold mb-3">{FEATURES[1].title}</h3>
						<p className="text-base text-muted-foreground leading-relaxed">
							{FEATURES[1].description}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[2].title}
					variants={STAGGER_ITEM}
					className="tiimo-card group p-8 will-change-transform"
					whileHover={{ y: -4 }}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-full ${FEATURES[2].color} flex items-center justify-center mb-6`}
						>
							<HugeiconsIcon icon={FEATURES[2].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-xl font-semibold mb-3">{FEATURES[2].title}</h3>
						<p className="text-base text-muted-foreground leading-relaxed">
							{FEATURES[2].description}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[3].title}
					variants={STAGGER_ITEM}
					className="tiimo-card group p-8 will-change-transform"
					whileHover={{ y: -4 }}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-full ${FEATURES[3].color} flex items-center justify-center mb-6`}
						>
							<HugeiconsIcon icon={FEATURES[3].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-xl font-semibold mb-3">{FEATURES[3].title}</h3>
						<p className="text-base text-muted-foreground leading-relaxed">
							{FEATURES[3].description}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[4].title}
					variants={STAGGER_ITEM}
					className="tiimo-card group p-8 will-change-transform"
					whileHover={{ y: -4 }}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-full ${FEATURES[4].color} flex items-center justify-center mb-6`}
						>
							<HugeiconsIcon icon={FEATURES[4].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-xl font-semibold mb-3">{FEATURES[4].title}</h3>
						<p className="text-base text-muted-foreground leading-relaxed">
							{FEATURES[4].description}
						</p>
					</div>
				</m.div>

				<m.div
					key={FEATURES[5].title}
					variants={STAGGER_ITEM}
					className="tiimo-card group p-8 will-change-transform"
					whileHover={{ y: -4 }}
				>
					<div className="flex flex-col h-full">
						<div
							className={`w-12 h-12 rounded-full ${FEATURES[5].color} flex items-center justify-center mb-6`}
						>
							<HugeiconsIcon icon={FEATURES[5].icon} className="w-6 h-6" />
						</div>
						<h3 className="text-xl font-semibold mb-3">{FEATURES[5].title}</h3>
						<p className="text-base text-muted-foreground leading-relaxed">
							{FEATURES[5].description}
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
