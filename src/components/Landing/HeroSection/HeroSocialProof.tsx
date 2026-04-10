'use client';

import { m } from 'framer-motion';
import Image from 'next/image';

const AVATARS = [
	'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&auto=format',
	'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&auto=format',
	'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&auto=format',
	'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&auto=format',
	'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&auto=format',
];

export function HeroSocialProof() {
	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.5 }}
			className="flex items-center gap-4 pt-4"
		>
			<div className="flex -space-x-3">
				{AVATARS.map((avatar, index) => (
					<div
						key={`hero-avatar-${index}`}
						className="w-10 h-10 rounded-full border-3 border-background bg-secondary flex items-center justify-center overflow-hidden relative shadow-sm img-outline"
					>
						<Image
							src={avatar}
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
