'use client';

import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface ConfettiProps {
	active: boolean;
	colors?: string[];
	particleCount?: number;
	duration?: number;
	onComplete?: () => void;
}

const DEFAULT_COLORS = ['#667eea', '#764ba2', '#a855f7', '#f59e0b', '#22c55e'];

interface Particle {
	id: number;
	x: number;
	color: string;
	rotation: number;
	size: number;
	shape: 'rect' | 'circle';
	velocityX: number;
	velocityY: number;
}

export function Confetti({
	active,
	colors = DEFAULT_COLORS,
	particleCount = 50,
	duration = 2000,
	onComplete,
}: ConfettiProps) {
	const [particles, setParticles] = useState<Particle[]>([]);

	const particleData = useMemo(() => {
		if (!active) return [];
		return Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			color: colors[Math.floor(Math.random() * colors.length)] || DEFAULT_COLORS[0],
			rotation: Math.random() * 720 - 360,
			size: 6 + Math.random() * 6,
			shape: (Math.random() > 0.7 ? 'circle' : 'rect') as 'rect' | 'circle',
			velocityX: (Math.random() - 0.5) * 30,
			velocityY: Math.random() * 10 + 5,
		}));
	}, [active, colors, particleCount]);

	useEffect(() => {
		if (active) {
			setParticles(particleData);
			const timer = setTimeout(() => {
				setParticles([]);
				onComplete?.();
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [active, particleData, duration, onComplete]);

	return (
		<LazyMotion features={domAnimation}>
			<AnimatePresence>
				{active && (
					<m.div
						className="fixed inset-0 pointer-events-none z-[9999]"
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						{particles.map((particle) => (
							<m.div
								key={particle.id}
								className="absolute"
								style={{
									left: `${particle.x}%`,
									top: '30%',
								}}
								initial={{
									y: 0,
									x: 0,
									rotate: 0,
									opacity: 1,
									scale: 1,
								}}
								animate={{
									y: 600,
									x: particle.velocityX * 20,
									rotate: particle.rotation,
									opacity: [1, 1, 0],
									scale: [1, 1, 0.5],
								}}
								transition={{
									duration: duration / 1000,
									ease: [0.25, 0.46, 0.45, 0.94],
								}}
							>
								<div
									className={particle.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}
									style={{
										width: particle.size,
										height: particle.shape === 'circle' ? particle.size : particle.size * 0.6,
										backgroundColor: particle.color,
										boxShadow: `0 0 ${particle.size}px ${particle.color}40`,
									}}
								/>
							</m.div>
						))}
					</m.div>
				)}
			</AnimatePresence>
		</LazyMotion>
	);
}
