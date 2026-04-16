'use client';

import { m } from 'framer-motion';
import { LANDING_STATS } from '@/content/landing';

const STATS = LANDING_STATS;

export function StatsSection() {
	return (
		<section className="py-16 lg:py-24 mx-4 lg:mx-0">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="max-w-7xl mx-auto px-6"
			>
				<div className="relative rounded-[var(--radius-2xl)] bg-muted/30 p-8 lg:p-12 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
					<div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
						{STATS.map((stat, index) => (
							<m.div
								key={stat.label}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className="text-center"
							>
								<p className="text-3xl lg:text-4xl font-bold text-primary mb-2 font-numeric">
									{stat.value}
								</p>
								<p className="text-muted-foreground text-sm">{stat.label}</p>
							</m.div>
						))}
					</div>
				</div>
			</m.div>
		</section>
	);
}
