'use client';

import { motion as m } from 'motion/react';

export function FloatingShapes() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<m.div
				animate={{
					y: [0, -20, 0],
					rotate: [0, 10, 0],
				}}
				transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
				className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-tiimo-lavender/20 to-purple-500/20 rounded-full blur-3xl"
			/>
			<m.div
				animate={{
					y: [0, 30, 0],
					rotate: [0, -15, 0],
				}}
				transition={{
					duration: 8,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
					delay: 1,
				}}
				className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl"
			/>
			<m.div
				animate={{
					y: [0, -15, 0],
					x: [0, 10, 0],
				}}
				transition={{
					duration: 7,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
					delay: 2,
				}}
				className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl"
			/>
		</div>
	);
}
