'use client';

import {
	ArrowRight01Icon,
	BrainIcon,
	CalculatorIcon,
	FlashIcon,
	SparklesIcon,
	StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface HeroSectionProps {
	onAuthRequired: (path: string) => void;
}

export function HeroSection({ onAuthRequired }: HeroSectionProps) {
	const router = useRouter();
	const prefersReducedMotion = useReducedMotion();
	const { scrollYProgress } = useScroll();

	const y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -100]);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, prefersReducedMotion ? 1 : 0]);

	return (
		<section className="pt-8 pb-20 lg:pt-8 lg:pb-32 lg:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
			<div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
				<m.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: 'spring', stiffness: 300, damping: 28 }}
					className="space-y-8"
				>
					<Badge className="bg-tiimo-lavender/15 text-tiimo-lavender rounded-full px-4 py-1.5 label-xs">
						<HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 mr-1.5" />
						Trusted by 50,000+ South African students
					</Badge>

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
						Get AI answers to any past paper question, find your weak spots, and pass matric the
						first time.
					</m.p>
				</m.div>

				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
				>
					<Button
						size="lg"
						className="w-full sm:w-auto h-14 rounded-[var(--radius-lg)] text-base font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] transition-all duration-200"
						onClick={() => onAuthRequired('/dashboard')}
					>
						<span className="flex items-center gap-2">
							Start Studying Free
							<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
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

				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="flex items-center gap-4 pt-4"
				>
					<div className="flex -space-x-3">
						{[1, 2, 3, 4, 5].map((item) => (
							<div
								key={`hero-avatar-${item}`}
								className="w-10 h-10 rounded-full border-3 border-background bg-secondary flex items-center justify-center overflow-hidden relative shadow-sm img-outline"
							>
								<Image
									src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&auto=format&random=${item}`}
									alt="Student success story"
									fill
									sizes="40px"
									className="object-cover"
									loading="lazy"
								/>
							</div>
						))}
					</div>
					<div className="text-left">
						<p className="body-sm font-semibold font-numeric tabular-nums">Join 50,000+ students</p>
						<p className="body-xs text-muted-foreground">who've already passed</p>
					</div>
				</m.div>

				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="flex items-center gap-4 pt-4"
				>
					<div className="flex -space-x-3">
						{[1, 2, 3, 4, 5].map((item) => (
							<div
								key={`hero-avatar-${item}`}
								className="w-10 h-10 rounded-full border-3 border-background bg-secondary flex items-center justify-center overflow-hidden relative shadow-sm img-outline"
							>
								<Image
									src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&auto=format&random=${item}`}
									alt="Student success story"
									fill
									sizes="40px"
									className="object-cover"
									loading="lazy"
								/>
							</div>
						))}
					</div>
					<div className="text-left">
						<p className="body-sm font-semibold font-numeric tabular-nums">Join 50,000+ students</p>
						<p className="body-xs text-muted-foreground">who've already passed</p>
					</div>
				</m.div>
			</div>

			<m.div
				initial={{ opacity: 0, x: 40 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
				className="relative w-full max-w-lg lg:max-w-xl"
				style={{ y, opacity }}
			>
				<m.div
					whileHover={{ scale: 1.02 }}
					className="relative w-full aspect-square max-w-lg mx-auto"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-tiimo-lavender/20 via-transparent to-subject-physics/20 rounded-[var(--radius-2xl)]" />

					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative w-64 h-64">
							<div className="absolute inset-0 flex items-center justify-center">
								<Image
									src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&crop=faces"
									alt="Students studying together"
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									className="object-cover rounded-[var(--radius-2xl)]"
									priority
									fetchPriority="high"
								/>
							</div>

							<m.div
								initial={{ opacity: 0, scale: 0.8, y: 10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								transition={{
									delay: 0.4,
									duration: 3.5,
									ease: 'easeInOut',
								}}
								className="absolute -top-2 -left-4 w-20 h-24 bg-card rounded-[var(--radius-lg)] shadow-xl border border-border/50 flex flex-col items-center justify-center p-2 z-10 will-change-transform"
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
								className="absolute -bottom-2 -right-4 w-20 h-24 bg-card rounded-[var(--radius-lg)] shadow-xl border border-border/50 flex flex-col items-center justify-center p-2 z-20 will-change-transform"
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
								className="absolute -right-4 -top-6 bg-card rounded-[var(--radius-lg)] p-2 shadow-xl border border-border/50"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-[var(--radius-md)] bg-success/10 flex items-center justify-center">
										<HugeiconsIcon icon={FlashIcon} className="w-5 h-5 text-success" />
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
								className="absolute -left-12 bottom-1/4 bg-card rounded-[var(--radius-lg)] p-2 shadow-xl border border-border/50"
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
								className="absolute -bottom-8 -left-1/4 bg-card rounded-[var(--radius-lg)] p-3 shadow-xl border border-border/50 flex items-center gap-2"
							>
								<div className="w-8 h-8 rounded-full bg-tiimo-yellow/20 flex items-center justify-center">
									<HugeiconsIcon icon={StarIcon} className="w-4 h-4 text-tiimo-yellow" />
								</div>
								<div>
									<p className="text-sm font-bold font-numeric">top 5%</p>
									<p className="text-[10px] text-muted-foreground">math challenge</p>
								</div>
							</m.div>
						</div>
					</div>
				</m.div>
			</m.div>
		</section>
	);
}
