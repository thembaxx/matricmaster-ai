'use client';

import { motion as m, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { LANDING_STATS } from '@/content/landing';

const STATS = LANDING_STATS;

export function StatsSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

	return (
		<section ref={sectionRef} className="py-20 lg:py-28">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-50px' }}
				transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				className="max-w-7xl mx-auto px-6"
			>
				<m.div
					style={{ y }}
					className="relative rounded-[3rem] bg-muted/20 p-10 lg:p-16 overflow-hidden"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03]" />
					<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px]" />
					<div className="relative grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-8">
						{STATS.map((stat, index) => (
							<m.div
								key={stat.label}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
								className="text-center"
							>
								<p className="text-4xl lg:text-5xl font-black text-primary mb-3 font-numeric tracking-tight">
									{stat.value}
								</p>
								<p className="text-muted-foreground text-base">{stat.label}</p>
							</m.div>
						))}
					</div>
				</m.div>
			</m.div>
		</section>
	);
}
