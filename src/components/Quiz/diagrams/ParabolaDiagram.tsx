'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { DiagramContainer } from './DiagramContainer';

interface ParabolaDiagramProps {
	className?: string;
}

export function ParabolaDiagram({ className }: ParabolaDiagramProps) {
	const [parabolaC, setParabolaC] = useState(0);

	return (
		<DiagramContainer
			className={className}
			label={'Vertical Shift (c)'}
			minLabel="Down"
			maxLabel="Up"
			value={parabolaC}
			onChange={setParabolaC}
			min={-40}
			max={40}
		>
			<svg viewBox="0 0 200 100" className="w-full h-full" role="img" aria-label="Parabola graph">
				<title>Parabola graph</title>
				<line
					x1="0"
					y1="50"
					x2="200"
					y2="50"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.2"
				/>
				<line
					x1="100"
					y1="0"
					x2="100"
					y2="100"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.2"
				/>
				<m.path
					animate={{
						d: `M 20 ${80 - parabolaC} Q 100 ${-20 - parabolaC} 180 ${80 - parabolaC}`,
					}}
					fill="none"
					stroke="var(--tiimo-lavender)"
					strokeWidth="3"
				/>
			</svg>
			<div className="absolute top-4 right-6 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
				<span className="text-[10px] font-black font-mono text-primary ">y = x² + {parabolaC}</span>
			</div>
		</DiagramContainer>
	);
}
