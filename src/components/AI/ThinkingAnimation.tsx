'use client';

import { motion as m } from 'motion/react';

interface ThinkingAnimationProps {
	className?: string;
}

export function ThinkingAnimation({ className }: ThinkingAnimationProps) {
	return (
		<div className={`relative ${className}`}>
			<m.div
				className="absolute inset-0 bg-gradient-to-tr from-brand-blue via-primary-violet to-accent-pink blur-3xl rounded-full"
				animate={{
					scale: [1, 1.1, 1],
					opacity: [0.3, 0.6, 0.3],
					rotate: [0, 90, 180, 270, 360],
				}}
				transition={{
					duration: 8,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
				}}
			/>
			<m.div
				className="absolute inset-0 bg-gradient-to-bl from-primary-cyan via-brand-blue to-accent-indigo blur-2xl rounded-full"
				animate={{
					scale: [1.1, 1, 1.1],
					opacity: [0.2, 0.5, 0.2],
					rotate: [360, 270, 180, 90, 0],
				}}
				transition={{
					duration: 10,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
				}}
			/>
		</div>
	);
}
