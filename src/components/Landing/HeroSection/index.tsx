'use client';

import { HeroBadge } from './HeroBadge';
import { HeroContent } from './HeroContent';
import { HeroCTAs } from './HeroCTAs';
import { HeroSocialProof } from './HeroSocialProof';
import { HeroVisual } from './HeroVisual';

interface HeroSectionProps {
	onAuthRequired: (path: string) => void;
}

export function HeroSection({ onAuthRequired }: HeroSectionProps) {
	return (
		<section className="pt-8 pb-20 lg:pt-8 lg:pb-32 lg:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
			<div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
				<HeroBadge />
				<HeroContent />
				<HeroCTAs onAuthRequired={onAuthRequired} />
				<HeroSocialProof />
			</div>
			<HeroVisual />
		</section>
	);
}
