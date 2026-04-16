'use client';

import { HeroContent } from './HeroContent';
import { HeroCTAs } from './HeroCTAs';
import { HeroSocialProof } from './HeroSocialProof';

interface HeroSectionProps {
	onAuthRequired: (path: string) => void;
}

export function HeroSection({ onAuthRequired }: HeroSectionProps) {
	return (
		<section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				}}
			/>
			<div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]" />
			<div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[150px]" />

			<div className="container relative z-10 mx-auto max-w-6xl px-6 py-24">
				<div className="text-center">
					<HeroContent />
					<div className="mt-10">
						<HeroCTAs onAuthRequired={onAuthRequired} />
					</div>
					<div className="mt-12">
						<HeroSocialProof />
					</div>
				</div>
			</div>
		</section>
	);
}
