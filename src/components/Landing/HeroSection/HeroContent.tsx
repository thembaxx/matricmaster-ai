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
				className="text-display text-foreground leading-[0.95] text-balance"
			>
				Finally, a study tool that actually works
			</m.h1>

			<m.p
				initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
				animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
				transition={shouldReduceMotion ? undefined : { delay: 0.2 }}
				className="body-lg text-muted-foreground max-w-lg text-pretty mx-auto lg:mx-0"
			>
				Get AI answers to any past paper question, find your weak spots, and pass matric the first
				time.
			</m.p>
		</>
	);
}
