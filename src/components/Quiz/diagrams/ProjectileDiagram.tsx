'use client';

import { motion as m } from 'motion/react';
import { useState } from 'react';
import { DiagramContainer } from './DiagramContainer';

interface ProjectileDiagramProps {
	className?: string;
}

export function ProjectileDiagram({ className }: ProjectileDiagramProps) {
	const [time, setTime] = useState(0.5);

	return (
		<DiagramContainer
			className={className}
			label={`Time = ${(time * 2).toFixed(1)}s`}
			minLabel="Launch"
			maxLabel="Land"
			value={time * 100}
			onChange={(v) => setTime(v / 100)}
			min={0}
			max={100}
		>
			<svg
				viewBox="0 0 200 120"
				className="w-full h-full"
				role="img"
				aria-label="Projectile motion diagram"
			>
				<title>Projectile motion</title>
				<line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="1" />
				<path
					d="M 10 100 Q 100 20 190 100"
					fill="none"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.2"
					strokeDasharray="4 2"
				/>
				<m.circle
					animate={{
						cx: 10 + time * 180,
						cy: 100 - 80 * Math.sin(time * Math.PI) * (1 - time),
					}}
					r="5"
					fill="var(--tiimo-lavender)"
				/>
				<m.line
					animate={{
						x2: 10 + time * 180 + 20 * (1 - time),
						y2: 100 - 80 * Math.sin(time * Math.PI) * (1 - time) - 20 * time,
					}}
					x1={10 + time * 180}
					y1={100 - 80 * Math.sin(time * Math.PI) * (1 - time)}
					x2={10 + time * 180}
					y2={100 - 80 * Math.sin(time * Math.PI) * (1 - time)}
					stroke="var(--tiimo-orange)"
					strokeWidth="2"
				/>
			</svg>
		</DiagramContainer>
	);
}
