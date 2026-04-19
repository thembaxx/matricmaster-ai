'use client';

import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface HeroCTAsProps {
	onAuthRequired: (path: string) => void;
}

export function HeroCTAs({ onAuthRequired }: HeroCTAsProps) {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();

	const containerVariants = shouldReduceMotion
		? undefined
		: {
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { staggerChildren: 0.1, delayChildren: 0.4 },
				},
			};

	const buttonVariants = shouldReduceMotion
		? undefined
		: {
				hidden: { opacity: 0, y: 10 },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: 0.5, ease: 'easeOut' as const },
				},
			};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="flex flex-col sm:flex-row gap-4 w-full sm:max-w-lg mx-auto"
		>
			<motion.div variants={buttonVariants}>
				<Button
					size="lg"
					className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-semibold bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all duration-300"
					onClick={() => onAuthRequired('/dashboard')}
				>
					<span className="flex items-center gap-2.5">
						Start Studying Free
						<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" aria-hidden="true" />
					</span>
				</Button>
			</motion.div>
			<motion.div variants={buttonVariants}>
				<Button
					size="lg"
					variant="outline"
					className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-medium text-foreground border-border/60 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:border-border active:scale-[0.98] transition-all duration-300"
					onClick={() => router.push('/past-papers')}
				>
					<span className="flex items-center gap-2.5">Explore Past Papers</span>
				</Button>
			</motion.div>
		</motion.div>
	);
}
