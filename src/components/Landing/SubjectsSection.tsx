'use client';

import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { m } from 'framer-motion';
import { SUBJECTS } from '@/constants/mock-data';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { SafeImage } from '../SafeImage';

interface SubjectsSectionProps {
	onAuthRequired: (path: string) => void;
}

export function SubjectsSection({ onAuthRequired }: SubjectsSectionProps) {
	return (
		<section className="py-20 lg:py-32">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6 }}
				className="mb-12"
			>
				<h2 className="heading-2 mb-4">
					Your
					<span className="text-tiimo-lavender"> subjects</span>
				</h2>
				<p className="text-lg text-muted-foreground">
					Pick your subjects and start practicing for the NSC.
				</p>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
			>
				{SUBJECTS.map((subject) => {
					const fluentEmoji = subject.fluentEmoji ?? 'Books';
					const imgSrc = subject.imgSrc;

					return (
						<m.button
							key={subject.id}
							type="button"
							variants={STAGGER_ITEM}
							onClick={() => onAuthRequired(subject.path)}
							className="tiimo-card group relative p-6 text-left overflow-hidden will-change-transform"
						>
							<div
								className={`absolute top-0 right-0 w-32 h-32 ${subject.bg} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`}
							/>

							<div className="relative z-10">
								<div
									className={`w-12 h-12 rounded-[var(--radius-lg)] ${subject.bg} flex items-center justify-center mb-4`}
								>
									{imgSrc && <SafeImage alt={subject.name} src={imgSrc} height={24} width={24} className='w-10 h-10'/>}
									{!imgSrc && <FluentEmoji
										type='3d'
										emoji={fluentEmoji}
										size={24}
										className={`w-6 h-6 ${subject.color}`}
									/>}
								</div>
								<h3 className="text-lg font-bold mb-1">{subject.name}</h3>
								<p className="text-sm text-muted-foreground">{subject.topics}</p>
							</div>

							<div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2">
								<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
							</div>
						</m.button>
					);
				})}
			</m.div>
		</section>
	);
}
