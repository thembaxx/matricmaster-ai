'use client';

import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
	const router = useRouter();
	const sectionRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
	const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

	return (
		<section ref={sectionRef} className="py-32 lg:py-48">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				style={{ y, scale }}
				className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary via-primary to-secondary p-12 lg:p-24"
			>
				<div className="absolute inset-0">
					<div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />
					<div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
				</div>

				<div className="relative z-10 text-center space-y-10">
					<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
						Start your
						<br />
						matric journey now
					</h2>
					<p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto leading-relaxed">
						Get access to AI-powered study tools, past exam papers, and instant explanations
						designed specifically for NSC Grade 12 success.
					</p>
					<div className="flex flex-col sm:flex-row gap-5 justify-center max-w-md mx-auto">
						<Button
							size="lg"
							className="w-full sm:w-auto h-14 px-10 rounded-full text-base font-semibold bg-background text-foreground hover:bg-background/90 shadow-2xl"
							onClick={() => router.push('/dashboard')}
						>
							<span className="flex items-center gap-3">
								Get Started Free
								<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
							</span>
						</Button>
					</div>
					<p className="text-sm text-white/60">No credit card needed</p>
				</div>
			</motion.div>
		</section>
	);
}
