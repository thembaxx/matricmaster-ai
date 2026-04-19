'use client';

import { motion, useReducedMotion } from 'motion/react';

export function HeroContent() {
	const shouldReduceMotion = useReducedMotion();

	const containerVariants = shouldReduceMotion
		? undefined
		: {
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: { staggerChildren: 0.12, delayChildren: 0.2 },
				},
			};

	const itemVariants = shouldReduceMotion
		? undefined
		: {
				hidden: { opacity: 0, y: 30 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
				},
			};

	return (
		<motion.div
			className="relative"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.h1
				variants={itemVariants}
				className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] text-foreground leading-[1.05] text-balance font-display max-w-6xl tracking-tight"
			>
				Pass your{' '}
				<span className="relative inline-block">
					<span className="relative z-10 text-primary">matric</span>
					<svg
						className="absolute -bottom-1 left-0 w-full h-0.5"
						viewBox="0 0 200 6"
						preserveAspectRatio="none"
					>
						<motion.path
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ delay: 0.8, duration: 1, ease: 'easeInOut' as const }}
							d="M0,3 Q50,5 100,3 T200,3"
							stroke="currentColor"
							strokeWidth="3"
							className="text-primary"
							fill="none"
						/>
					</svg>
				</span>{' '}
				with <br className="sm:hidden" />
				confidence
			</motion.h1>

			<motion.p
				variants={itemVariants}
				className="mt-10 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-center text-balance leading-relaxed"
			>
				AI-powered explanations, adaptive practice, and proven study methods. Join thousands of
				South African students who achieved their university goals.
			</motion.p>
		</motion.div>
	);
}
