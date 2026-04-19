'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { HeroContent } from './HeroContent';
import { HeroCTAs } from './HeroCTAs';

interface HeroSectionProps {
	onAuthRequired: (path: string) => void;
}

export function HeroSection({ onAuthRequired }: HeroSectionProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start start', 'end start'],
	});

	const bgY = useTransform(scrollYProgress, [0, 1], [0, -80]);
	const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);
	const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

	const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 150]);
	const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
	const orb1Scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
	const orb2Scale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);

	return (
		<section
			ref={sectionRef}
			className="relative min-h-[95vh] flex items-center justify-center overflow-hidden"
		>
			<motion.div style={{ y: bgY }} className="absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
				<motion.div
					style={{ scale: orb1Scale, y: orb1Y }}
					className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[180px] opacity-40"
				>
					<div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/5 rounded-full" />
				</motion.div>
				<motion.div
					style={{ scale: orb2Scale, y: orb2Y }}
					className="absolute -bottom-[30%] -left-[20%] w-[900px] h-[900px] rounded-full blur-[200px] opacity-30"
				>
					<div className="w-full h-full bg-gradient-to-tr from-secondary/40 via-secondary/20 to-transparent rounded-full" />
				</motion.div>
			</motion.div>

			<div
				className="absolute inset-0 opacity-[0.015]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				}}
			/>

			<motion.div
				style={{ y: textY, opacity: textOpacity }}
				className="container relative z-10 mx-auto max-w-6xl px-6 py-24 sm:py-32"
			>
				<HeroContent />

				<div className="mt-14">
					<HeroCTAs onAuthRequired={onAuthRequired} />
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8, duration: 1 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2"
			>
				<div className="flex flex-col items-center gap-2">
					<div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
						<motion.div
							animate={{ y: [0, 12, 0] }}
							transition={{
								repeat: Number.POSITIVE_INFINITY,
								duration: 1.5,
								ease: 'easeInOut' as const,
							}}
							className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
						/>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
