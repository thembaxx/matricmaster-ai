'use client';

import { motion as m } from 'motion/react';
import Image from 'next/image';
import { memo } from 'react';

interface TrophySectionProps {
	accuracy: number;
}

export const TrophySection = memo(function TrophySection({ accuracy }: TrophySectionProps) {
	const getMessage = () => {
		if (accuracy >= 80) return 'Excellent work! You nailed it!';
		if (accuracy >= 60) return 'Great effort! Keep practicing!';
		return "Good try! You're making progress!";
	};

	return (
		<div className="relative mb-12 w-56 h-56 flex items-center justify-center">
			<m.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1 }}
				transition={{ type: 'spring', damping: 10, stiffness: 200 }}
				className="absolute inset-0 bg-primary-orange/10 rounded-[3rem] blur-2xl"
			/>
			<m.div
				initial={{ scale: 0.95, opacity: 0, rotate: -180 }}
				animate={{ scale: 1, rotate: 0 }}
				transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
			>
				<Image
					src="https://images.unsplash.com/photo-1579546671584-62dcfaf35ad0?w=400&h=400&fit=crop"
					alt="Trophy"
					width={160}
					height={160}
					priority
					sizes="160px"
					className="object-contain rounded-2xl shadow-xl shadow-yellow-500/10"
				/>
			</m.div>
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="text-center space-y-3 mb-12"
			>
				<h2 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter  leading-none">
					Lesson Complete!
				</h2>
				<p className="text-muted-foreground dark:text-muted-foreground font-medium text-lg">
					{getMessage()}
				</p>
			</m.div>
		</div>
	);
});
