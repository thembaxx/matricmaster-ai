'use client';

import { motion, useReducedMotion } from 'motion/react';

export function HeroContent() {
	const shouldReduceMotion = useReducedMotion();

	return (
		<>
			<motion.h1
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
				animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				transition={shouldReduceMotion ? undefined : { delay: 0.1 }}
				className="text-display text-foreground leading-[0.95] text-balance font-display max-w-6xl"
			>
				Pass your <span className="text-primary">matric exams</span> with confidence
			</motion.h1>

			<motion.p
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
				animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				transition={shouldReduceMotion ? undefined : { delay: 0.2 }}
				className="body-lg text-muted-foreground max-w-2xl text-pretty"
			>
				AI-powered explanations, adaptive practice, and proven study methods. Join thousands of
				students who improved their marks and achieved their university goals.
			</motion.p>
		</>
	);
}
