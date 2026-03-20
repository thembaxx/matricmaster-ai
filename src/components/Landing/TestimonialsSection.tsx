'use client';

import { StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { appConfig } from '@/app.config';
import { LANDING_TESTIMONIALS } from '@/data/landing';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

const TESTIMONIALS = LANDING_TESTIMONIALS;

export function TestimonialsSection() {
	return (
		<section className="py-20 lg:py-32">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6 }}
				className="text-center mb-16"
			>
				<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
					Loved by
					<span className="text-tiimo-lavender"> thousands</span>
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					See what South African students are saying about {appConfig.name}.
				</p>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="grid md:grid-cols-3 gap-6"
			>
				{TESTIMONIALS.map((testimonial) => (
					<m.div
						key={testimonial.name}
						variants={STAGGER_ITEM}
						className="p-8 rounded-[var(--radius-xl)] bg-card border border-border/50 hover:border-tiimo-lavender/30 transition-all duration-300"
					>
						<div className="flex items-center gap-1 mb-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<HugeiconsIcon
									key={`star-${i}`}
									icon={StarIcon}
									className="w-5 h-5 text-tiimo-yellow fill-tiimo-yellow"
								/>
							))}
						</div>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							&quot;{testimonial.quote}&quot;
						</p>
						<div className="flex items-center gap-4">
							<Image
								src={testimonial.image}
								alt={testimonial.name}
								width={48}
								height={48}
								className="rounded-full object-cover"
								loading="lazy"
							/>
							<div>
								<p className="font-bold">{testimonial.name}</p>
								<p className="text-sm text-muted-foreground">{testimonial.grade}</p>
							</div>
						</div>
					</m.div>
				))}
			</m.div>
		</section>
	);
}
