'use client';

import { motion as m } from 'motion/react';
import { useState } from 'react';
import { DiagramContainer } from './DiagramContainer';

interface CircleDiagramProps {
	className?: string;
}

export function CircleDiagram({ className }: CircleDiagramProps) {
	const [radius, setRadius] = useState(40);

	return (
		<DiagramContainer
			className={className}
			label={`Radius = ${radius}`}
			minLabel="Small"
			maxLabel="Large"
			value={radius}
			onChange={setRadius}
			min={10}
			max={55}
		>
			<svg viewBox="0 0 200 120" className="w-full h-full" role="img" aria-label="Circle diagram">
				<title>Circle diagram</title>
				<line
					x1="100"
					y1="0"
					x2="100"
					y2="120"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.1"
				/>
				<line
					x1="0"
					y1="60"
					x2="200"
					y2="60"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.1"
				/>
				<m.circle
					animate={{ r: radius }}
					cx="100"
					cy="60"
					fill="none"
					stroke="var(--tiimo-lavender)"
					strokeWidth="2"
				/>
				<m.line
					animate={{ x2: 100 + radius }}
					x1="100"
					y1="60"
					x2="100"
					y2="60"
					stroke="var(--tiimo-orange)"
					strokeWidth="2"
				/>
				<circle cx="100" cy="60" r="3" fill="var(--tiimo-blue)" />
				<text x={100 + radius / 2} y="55" fontSize="10" fill="var(--tiimo-orange)">
					r
				</text>
			</svg>
		</DiagramContainer>
	);
}
