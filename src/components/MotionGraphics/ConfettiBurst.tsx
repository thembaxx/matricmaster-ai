import { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { TIIMO_COLORS } from './tokens';

interface ConfettiBurstProps {
	active: boolean;
	particleCount?: number;
}

const COLORS = [
	TIIMO_COLORS.lavender,
	TIIMO_COLORS.green,
	TIIMO_COLORS.yellow,
	TIIMO_COLORS.blue,
	TIIMO_COLORS.pink,
	TIIMO_COLORS.orange,
];

export function ConfettiBurst({ active, particleCount = 30 }: ConfettiBurstProps) {
	const frame = useCurrentFrame();

	const particles = useMemo(() => {
		if (!active) return [];

		return [...Array(particleCount)].map((_, i) => ({
			id: i,
			startX: Math.random() * 400 - 200,
			startY: 0,
			endX: (Math.random() - 0.5) * 300,
			endY: Math.random() * 200 + 100,
			rotation: Math.random() * 720 - 360,
			delay: Math.random() * 10,
			color: COLORS[i % COLORS.length],
			size: Math.random() * 8 + 4,
		}));
	}, [active, particleCount]);

	if (!active) return null;

	return (
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
			}}
		>
			{particles.map((p) => {
				const progress = interpolate(frame, [p.delay, p.delay + 30], [0, 1]);

				if (progress === 0) return null;

				const x = p.startX + p.endX * progress;
				const y = p.startY + p.endY * progress + progress * progress * 50;
				const rotation = p.rotation * progress;
				const opacity = interpolate(progress, [0.8, 1], [1, 0]);

				return (
					<div
						key={p.id}
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							width: p.size,
							height: p.size,
							backgroundColor: p.color,
							borderRadius: Math.random() > 0.5 ? '50%' : '2px',
							transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
							opacity,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
}
