'use client';

import { StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { LANDING_TESTIMONIALS } from '@/content/landing';
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
				<h2 className="heading-2 mb-4">
					Proven by
					<span className="text-tiimo-lavender"> thousands</span> of NSC learners
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					See how Lumni helped South African students achieve their matric goals — and how you can
					too.
				</p>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
			>
				{TESTIMONIALS.map((testimonial) => (
					<m.div
						key={testimonial.name}
						variants={STAGGER_ITEM}
						className="tiimo-card p-8 will-change-transform"
					>
						<div className="flex items-center gap-1 mb-4" role="img" aria-label="5 out of 5 stars">
							{[1, 2, 3, 4, 5].map((item) => (
								<HugeiconsIcon
									key={`testimonial-star-${item}`}
									icon={StarIcon}
									className="w-5 h-5 text-tiimo-yellow fill-tiimo-yellow"
									aria-hidden="true"
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
								className="rounded-full object-cover img-outline"
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
