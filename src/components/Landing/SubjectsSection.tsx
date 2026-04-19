'use client';

import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { motion as m, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { SUBJECTS_CONTENT } from '@/content';

interface SubjectsSectionProps {
	onAuthRequired: (path: string) => void;
}

export function SubjectsSection({ onAuthRequired }: SubjectsSectionProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [80, -80]);

	return (
		<section ref={sectionRef} className="py-32 lg:py-44">
			<m.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				className="max-w-7xl mx-auto px-6 mb-16"
			>
				<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
					Your subjects
				</h2>
				<p className="text-lg text-muted-foreground">
					Pick your subjects and start practicing for the NSC.
				</p>
			</m.div>

			<m.div style={{ y }} className="max-w-7xl mx-auto px-6">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{SUBJECTS_CONTENT.map((subject, index) => {
						const fluentEmoji = subject.fluentEmoji ?? 'Books';

						return (
							<m.button
								key={subject.id}
								type="button"
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true, margin: '-50px' }}
								transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
								onClick={() => onAuthRequired(`/subjects/${subject.id}`)}
								className="group relative p-6 rounded-3xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/40 transition-all duration-300 overflow-hidden text-left"
							>
								<div
									className={`absolute top-0 right-0 w-40 h-40 ${subject.bgColor} rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`}
								/>

								<div className="relative z-10">
									<div
										className={`w-14 h-14 rounded-2xl ${subject.bgColor} flex items-center justify-center mb-5 overflow-hidden`}
									>
										<FluentEmoji type="3d" emoji={fluentEmoji} size={36} />
									</div>
									<h3 className="text-lg font-bold mb-1">{subject.name}</h3>
									<p className="text-sm text-muted-foreground">{subject.description}</p>
								</div>

								<div className="absolute bottom-5 right-5 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2">
									<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
								</div>
							</m.button>
						);
					})}
				</div>
			</m.div>
		</section>
	);
}
