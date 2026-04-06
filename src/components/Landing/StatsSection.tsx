'use client';

import { m } from 'framer-motion';
import { LANDING_STATS } from '@/content/landing';

const STATS = LANDING_STATS;

export function StatsSection() {
	return (
		<section className="py-12 lg:py-16 bg-muted/30 rounded-[var(--radius-2xl)] mx-4 lg:mx-0">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="max-w-7xl mx-auto px-6"
			>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
					{STATS.map((stat, index) => (
						<m.div
							key={stat.label}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="text-center px-4"
						>
							<p className="text-3xl lg:text-4xl font-bold text-tiimo-lavender mb-2 font-numeric">
								{stat.value.toLowerCase()}
							</p>
							<p className="text-muted-foreground label-sm text-balance">
								{stat.label.toLowerCase()}
							</p>
						</m.div>
					))}
				</div>
			</m.div>
		</section>
	);
}
