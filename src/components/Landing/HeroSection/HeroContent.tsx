'use client';

import { m } from 'framer-motion';

export function HeroContent() {
	return (
		<>
			<m.h1
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="text-display text-foreground leading-[0.95] text-balance"
			>
				Finally, a study tool that actually works
			</m.h1>

			<m.p
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="body-lg text-muted-foreground max-w-lg text-pretty mx-auto lg:mx-0"
			>
				Get AI answers to any past paper question, find your weak spots, and pass matric the first
				time.
			</m.p>
		</>
	);
}
