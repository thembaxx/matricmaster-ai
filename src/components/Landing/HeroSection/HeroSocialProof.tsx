'use client';

import { m } from 'framer-motion';
import Image from 'next/image';

export function HeroSocialProof() {
	return (
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
	);
}
