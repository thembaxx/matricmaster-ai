'use client';

import { m, useReducedMotion } from 'framer-motion';

export function HeroContent() {
	const shouldReduceMotion = useReducedMotion();

	return (
		<>
			<m.h1
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
				animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				transition={shouldReduceMotion ? undefined : { delay: 0.1 }}
				className="text-display text-foreground leading-[0.95] text-balance font-display"
			>
				Pass your <span className="text-primary">matric exams</span> with confidence
			</m.h1>

			<m.p
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
				animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				transition={shouldReduceMotion ? undefined : { delay: 0.2 }}
				className="body-lg text-muted-foreground max-w-xl text-pretty mx-auto lg:mx-0"
			>
				AI-powered explanations, adaptive practice, and proven study methods. Join thousands of
				students who improved their marks and achieved their university goals.
			</m.p>
		</>
	);
}
