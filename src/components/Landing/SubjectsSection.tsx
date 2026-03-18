'use client';

import {
	ArrowRight01Icon,
	AtomIcon,
	CalculatorIcon,
	Chemistry01Icon,
	MicroscopeIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { m } from 'framer-motion';
import { SUBJECTS } from '@/constants/mock-data';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

const ICON_MAP: Record<string, IconSvgElement> = {
	Calculator: CalculatorIcon,
	Atom: AtomIcon,
	FlaskConical: Chemistry01Icon,
	Microscope: MicroscopeIcon,
};

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
				<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
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
					const icon = ICON_MAP[subject.icon as keyof typeof ICON_MAP] || CalculatorIcon;
					return (
						<m.button
							key={subject.id}
							type="button"
							variants={STAGGER_ITEM}
							onClick={() => onAuthRequired(subject.path)}
							className="group relative p-6 rounded-[var(--radius-xl)] bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-left overflow-hidden"
						>
							<div
								className={`absolute top-0 right-0 w-32 h-32 ${subject.bg} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`}
							/>

							<div className="relative z-10">
								<div
									className={`w-12 h-12 rounded-[var(--radius-lg)] ${subject.bg} flex items-center justify-center mb-4`}
								>
									<HugeiconsIcon icon={icon} className={`w-6 h-6 ${subject.color}`} />
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
