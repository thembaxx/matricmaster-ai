'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { generateWavePoints } from '@/lib/physics/waves';
import { useScienceLab } from '@/stores/useScienceLab';

export function WaveCanvas() {
	const { wave } = useScienceLab();
	const phaseRef = useRef(0);
	const frameRef = useRef<number | null>(null);
	const [, setTick] = useState(0);

	useEffect(() => {
		let lastTime = 0;
		const animate = (time: number) => {
			if (time - lastTime >= 50) {
				phaseRef.current += wave.frequency * 0.1;
				setTick((t) => t + 1);
				lastTime = time;
			}
			frameRef.current = requestAnimationFrame(animate);
		};
		frameRef.current = requestAnimationFrame(animate);
		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [wave.frequency]);

	const points = useMemo(
		() => generateWavePoints(wave.amplitude, wave.frequency, phaseRef.current),
		[wave.amplitude, wave.frequency]
	);

	const pathD = points
		.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 80 + 40} ${100 - p.y * 40}`)
		.join(' ');

	return (
		<Card className="relative p-8 min-h-[300px]">
			<svg
				viewBox="0 0 400 200"
				className="w-full h-full"
				role="img"
				aria-label="Wave motion diagram"
			>
				<title>Wave Motion</title>
				{/* Axis */}
				<line
					x1="20"
					y1="100"
					x2="380"
					y2="100"
					stroke="currentColor"
					strokeWidth="1"
					opacity="0.3"
				/>

				{/* Wave */}
				<path d={pathD} fill="none" stroke="var(--tiimo-lavender)" strokeWidth="3" />

				{/* Labels */}
				<text x="200" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
					λ = {(20 / wave.frequency).toFixed(2)} units
				</text>
			</svg>

			{/* Equation */}
			<div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-4 py-2 rounded-xl border font-mono text-sm">
				y = {wave.amplitude} sin({wave.frequency}x - {phaseRef.current.toFixed(2)})
			</div>
		</Card>
	);
}
