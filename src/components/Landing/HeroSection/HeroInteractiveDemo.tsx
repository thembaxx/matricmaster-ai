'use client';

import {
	BrainIcon,
	CalculatorIcon,
	Camera01Icon,
	CheckmarkSquare01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

const DEMO_STEPS = [
	{
		id: 'question',
		title: 'Snap a question',
		description: 'Take a photo of any exam question',
		icon: Camera01Icon,
		content: (
			<div className="flex flex-col items-center gap-4 p-4">
				<div className="w-32 h-20 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
					<HugeiconsIcon icon={Camera01Icon} className="w-8 h-8 text-muted-foreground" />
				</div>
				<p className="text-sm text-muted-foreground text-center">Math problem from NSC Paper 1</p>
			</div>
		),
	},
	{
		id: 'ai-thinking',
		title: 'AI analyzes',
		description: 'Our AI understands the question instantly',
		icon: BrainIcon,
		content: (
			<div className="flex flex-col items-center gap-4 p-4">
				<div className="w-32 h-20 bg-tiimo-lavender/10 rounded-lg flex items-center justify-center relative">
					<HugeiconsIcon icon={BrainIcon} className="w-8 h-8 text-tiimo-lavender animate-pulse" />
					<div className="absolute -top-1 -right-1 w-3 h-3 bg-tiimo-lavender rounded-full animate-ping" />
				</div>
				<div className="flex gap-1">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="w-2 h-2 bg-tiimo-lavender rounded-full animate-pulse"
							style={{ animationDelay: `${i * 0.2}s` }}
						/>
					))}
				</div>
				<p className="text-sm text-muted-foreground text-center">Analyzing question...</p>
			</div>
		),
	},
	{
		id: 'solution',
		title: 'Get solution',
		description: 'Step-by-step explanation with the answer',
		icon: CalculatorIcon,
		content: (
			<div className="flex flex-col gap-3 p-4">
				<div className="bg-card rounded-lg p-3 border">
					<p className="text-sm font-mono mb-2">f(x) = x² + 3x - 10</p>
					<p className="text-sm font-mono mb-2">f'(x) = 2x + 3</p>
					<p className="text-sm font-mono text-tiimo-lavender">Critical points: x = -3/2</p>
				</div>
				<div className="flex items-center gap-2 text-sm text-success">
					<HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4" />
					<span>Solution complete</span>
				</div>
			</div>
		),
	},
];

export function HeroInteractiveDemo() {
	const [currentStep, setCurrentStep] = useState(0);
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		if (prefersReducedMotion) return;

		const interval = setInterval(() => {
			setCurrentStep((prev) => (prev + 1) % DEMO_STEPS.length);
		}, 3000);

		return () => clearInterval(interval);
	}, [prefersReducedMotion]);

	const currentDemo = DEMO_STEPS[currentStep];

	return (
		<m.div
			initial={{ opacity: 0, x: 40 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
			className="relative w-full max-w-lg lg:max-w-xl"
		>
			<m.div
				whileHover={{ scale: 1.02 }}
				className="relative w-full aspect-square max-w-lg mx-auto"
			>
				<div className="absolute inset-0 bg-gradient-to-br from-tiimo-lavender/20 via-transparent to-subject-physics/20 rounded-[var(--radius-2xl)]" />

				<div className="absolute inset-0 flex items-center justify-center">
					<div className="relative w-80 h-80 bg-card rounded-[var(--radius-2xl)] shadow-elevation-2 border border-border/50 overflow-hidden">
						{/* Demo Header */}
						<div className="bg-muted/50 px-4 py-3 border-b border-border/50">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-tiimo-lavender rounded-lg flex items-center justify-center">
									<HugeiconsIcon icon={currentDemo.icon} className="w-4 h-4 text-white" />
								</div>
								<div>
									<h3 className="text-sm font-semibold">{currentDemo.title}</h3>
									<p className="text-xs text-muted-foreground">{currentDemo.description}</p>
								</div>
							</div>
						</div>

						{/* Demo Content */}
						<div className="flex-1 p-4">{currentDemo.content}</div>

						{/* Progress Indicators */}
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
							{DEMO_STEPS.map((_, index) => (
								<button
									type="button"
									key={index}
									onClick={() => setCurrentStep(index)}
									className={`w-2 h-2 rounded-full transition-all duration-300 ${
										index === currentStep ? 'bg-tiimo-lavender scale-125' : 'bg-muted-foreground/30'
									}`}
									aria-label={`View demo step ${index + 1}`}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Floating Achievement Cards */}
				<m.div
					initial={{ opacity: 0, scale: 0.8, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{
						delay: 0.4,
						duration: 3.5,
						ease: 'easeInOut',
					}}
					className="absolute top-1/2 -right-0.5 px-4 bg-card rounded-[var(--radius-lg)] shadow-elevation-2 border border-border/50 flex flex-col items-center justify-center p-2 z-10 will-change-transform"
				>
					<div className="w-8 h-8 rounded-[var(--radius-md)] bg-subject-math/20 flex items-center justify-center mb-1">
						<HugeiconsIcon icon={CalculatorIcon} className="w-4 h-4 text-subject-math" />
					</div>
					<div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
						<div className="h-full w-3/4 bg-subject-math rounded-full" />
					</div>
					<span className="label-xs font-numeric tabular-nums">math 92%</span>
				</m.div>

				<m.div
					initial={{ opacity: 0, scale: 0.8, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{
						delay: 0.5,
						ease: 'easeInOut',
					}}
					className="absolute -bottom-2 right-1.5 h-24 bg-card rounded-[var(--radius-lg)] shadow-elevation-2 border border-border/50 flex flex-col items-center justify-center p-2 z-20 will-change-transform"
				>
					<div className="w-8 h-8 rounded-[var(--radius-md)] bg-subject-life/20 flex items-center justify-center mb-1">
						<HugeiconsIcon icon={BrainIcon} className="w-4 h-4 text-subject-life" />
					</div>
					<div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
						<div className="h-full w-1/2 bg-subject-life rounded-full" />
					</div>
					<span className="label-xs font-numeric tabular-nums">physics 78%</span>
				</m.div>

				<m.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.6 }}
					className="absolute -right-4 top-1.5 bg-card rounded-[var(--radius-lg)] p-2 shadow-elevation-2 border border-border/50"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-[var(--radius-md)] bg-success/10 flex items-center justify-center">
							<span className="text-lg">🚀</span>
						</div>
						<div>
							<p className="text-xs font-bold font-numeric tabular-nums">2,450</p>
							<p className="text-xs text-muted-foreground">xp earned</p>
						</div>
					</div>
				</m.div>

				<m.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.7 }}
					className="absolute -left-12 bottom-1/4 bg-card rounded-[var(--radius-lg)] p-2 shadow-elevation-2 border border-border/50"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-[var(--radius-md)] bg-orange-100 flex items-center justify-center">
							<span className="text-lg">🔥</span>
						</div>
						<div>
							<p className="text-xs font-bold font-numeric tabular-nums">12 day</p>
							<p className="text-xs text-muted-foreground">study streak</p>
						</div>
					</div>
				</m.div>

				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.2 }}
					className="absolute -bottom-3 left-0 bg-card rounded-[var(--radius-lg)] p-3 shadow-elevation-2 border border-border/50 flex items-center gap-2"
				>
					<div className="w-8 h-8 rounded-full bg-tiimo-yellow/20 flex items-center justify-center">
						<span className="text-sm">⭐</span>
					</div>
					<div>
						<p className="text-sm font-bold font-numeric">top 5%</p>
						<p className="text-[10px] text-muted-foreground">math challenge</p>
					</div>
				</m.div>
			</m.div>
		</m.div>
	);
}
