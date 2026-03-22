'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { DiagramContainer } from './DiagramContainer';

interface WaveDiagramProps {
	className?: string;
}

export function WaveDiagram({ className }: WaveDiagramProps) {
	const [wavePhase, setWavePhase] = useState(0);

	return (
		<DiagramContainer
			className={className}
			label="Wave Animation"
			minLabel="Phase"
			maxLabel="Shift"
			value={wavePhase}
			onChange={setWavePhase}
			min={0}
			max={100}
		>
			<svg viewBox="0 0 200 120" className="w-full h-full" role="img" aria-label="Wave diagram">
				<title>Wave motion</title>
				<line
					x1="0"
					y1="60"
					x2="200"
					y2="60"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.2"
				/>
				<m.path
					animate={{
						d: `M 0 60 ${Array.from({ length: 21 }, (_, i) => `L ${i * 10} ${60 - 30 * Math.sin(i * 0.5 + wavePhase * 0.1)}`).join(' ')}`,
					}}
					fill="none"
					stroke="var(--tiimo-lavender)"
					strokeWidth="2"
				/>
				<line x1="20" y1="100" x2="60" y2="100" stroke="var(--tiimo-orange)" strokeWidth="1" />
				<text x="35" y="108" fontSize="8" fill="var(--tiimo-orange)">
					λ
				</text>
				<line x1="170" y1="30" x2="170" y2="90" stroke="var(--tiimo-blue)" strokeWidth="1" />
				<text x="175" y="60" fontSize="8" fill="var(--tiimo-blue)">
					A
				</text>
			</svg>
		</DiagramContainer>
	);
}
