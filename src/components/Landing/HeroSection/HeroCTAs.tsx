'use client';

import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface HeroCTAsProps {
	onAuthRequired: (path: string) => void;
}

export function HeroCTAs({ onAuthRequired }: HeroCTAsProps) {
	const router = useRouter();
	const shouldReduceMotion = useReducedMotion();

	return (
		<m.div
			initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
			animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
			transition={shouldReduceMotion ? undefined : { delay: 0.3 }}
			className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:max-w-md"
		>
			<Button
				size="lg"
				className="w-full sm:w-auto h-14 rounded-[var(--radius-lg)] text-base font-semibold bg-primary text-primary-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:shadow-primary/30 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] transition-all duration-200"
				onClick={() => onAuthRequired('/dashboard')}
			>
				<span className="flex items-center gap-2">
					Start Studying Free
					<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" aria-hidden="true" />
				</span>
			</Button>
			<Button
				size="lg"
				variant="outline"
				className="w-full sm:w-auto h-14 rounded-[var(--radius-lg)] text-base font-medium text-primary border-border hover:bg-accent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] transition-all duration-200"
				onClick={() => router.push('/past-papers')}
			>
				<span className="flex items-center gap-2">See How It Works</span>
			</Button>
		</m.div>
	);
}
