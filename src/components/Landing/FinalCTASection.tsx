'use client';

import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
	const router = useRouter();
	const ctaPatternId = useId();

	return (
		<section className="py-20 lg:py-32">
			<m.div
				initial={{ opacity: 0, scale: 0.95 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-tiimo-lavender via-tiimo-lavender to-subject-physics p-12 lg:p-20"
			>
				<div className="absolute inset-0 opacity-10">
					<svg
						className="w-full h-full"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
						role="img"
						aria-label="Decorative pattern"
					>
						<pattern id={ctaPatternId} width="10" height="10" patternUnits="userSpaceOnUse">
							<circle cx="1" cy="1" r="1" fill="white" />
						</pattern>
						<rect width="100%" height="100%" fill={`url(#${ctaPatternId})`} />
					</svg>
				</div>

				<div className="relative z-10 text-center space-y-8">
					<h2 className="heading-1 text-white">
						Start your
						<br />
						matric journey now
					</h2>
					<p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto">
						Get access to AI-powered study tools, past exam papers, and instant explanations
						designed specifically for NSC Grade 12 success.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							className="w-full sm:w-auto h-14 rounded-[var(--radius-lg)] text-base font-semibold bg-white dark:bg-zinc-900 text-tiimo-lavender hover:bg-white/90 dark:hover:bg-zinc-800 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-tiimo-lavender active:scale-[0.98] transition-all duration-200"
							onClick={() => router.push('/sign-up')}
						>
							<span className="flex items-center gap-2">
								Start Your Free Trial
								<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
							</span>
						</Button>
					</div>
					<p className="text-sm text-white/60">No credit card needed</p>
				</div>
			</m.div>
		</section>
	);
}
