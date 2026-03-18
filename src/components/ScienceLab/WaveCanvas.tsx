'use client';

import { useEffect, useState } from 'react';
import { generateWavePoints } from '@/lib/physics/waves';
import { useScienceLab } from '@/stores/useScienceLab';

export function WaveCanvas() {
	const { wave } = useScienceLab();
	const [phase, setPhase] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setPhase((p) => p + wave.frequency * 0.1);
		}, 50);
		return () => clearInterval(interval);
	}, [wave.frequency]);

	const points = generateWavePoints(wave.amplitude, wave.frequency, phase);

	const pathD = points
		.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 80 + 40} ${100 - p.y * 40}`)
		.join(' ');

	return (
		<div className="relative bg-card rounded-2xl p-8 min-h-[300px]">
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
				y = {wave.amplitude} sin({wave.frequency}x - {phase.toFixed(2)})
			</div>
		</div>
	);
}
