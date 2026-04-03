'use client';

import { Camera01Icon, ChartIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

const STEPS = [
	{
		icon: Camera01Icon,
		title: 'Upload Question',
		description: 'Snap a photo or type any past paper question',
		color: 'bg-tiimo-lavender/10 text-tiimo-lavender',
	},
	{
		icon: SparklesIcon,
		title: 'Get AI Help',
		description: 'Our AI explains the solution step-by-step',
		color: 'bg-subject-math/10 text-subject-math',
	},
	{
		icon: ChartIcon,
		title: 'Track Progress',
		description: "See which topics you've mastered and what needs work",
		color: 'bg-tiimo-green/10 text-tiimo-green',
	},
];

export function HowItWorksSection() {
	return (
		<section className="py-20 lg:py-32 bg-background">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6 }}
				className="text-center mb-16"
			>
				<h2 className="heading-2 mb-4">How Lumni Works</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Three simple steps to boost your matric results
				</p>
			</m.div>

			<m.div
				variants={STAGGER_CONTAINER}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-100px' }}
				className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4"
			>
				{STEPS.map((step, index) => (
					<m.div
						key={step.title}
						variants={STAGGER_ITEM}
						className="relative flex flex-col items-center text-center group"
					>
						<div className="relative mb-6">
							<div
								className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center`}
							>
								<HugeiconsIcon icon={step.icon} className="w-8 h-8" />
							</div>
							<div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background text-sm font-medium flex items-center justify-center">
								{index + 1}
							</div>
						</div>
						<h3 className="text-lg font-semibold mb-2">{step.title}</h3>
						<p className="text-base text-muted-foreground leading-relaxed max-w-[240px] sm:max-w-sm">
							{step.description}
						</p>
						{index < STEPS.length - 1 && (
							<div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-tiimo-lavender/30 to-transparent" />
						)}
					</m.div>
				))}
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.3 }}
				className="mt-16 text-center"
			>
				<Button size="lg" className="px-8">
					Try It Free
				</Button>
			</m.div>
		</section>
	);
}
