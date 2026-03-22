'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { DiagramContainer } from './DiagramContainer';

interface TriangleDiagramProps {
	className?: string;
}

export function TriangleDiagram({ className }: TriangleDiagramProps) {
	const [angle, setAngle] = useState(30);

	return (
		<DiagramContainer
			className={className}
			label={`Angle θ = ${angle}°`}
			minLabel="0°"
			maxLabel="90°"
			value={angle}
			onChange={setAngle}
			min={0}
			max={90}
		>
			<svg viewBox="0 0 200 120" className="w-full h-full" role="img" aria-label="Triangle diagram">
				<title>Triangle for trigonometry</title>
				<line x1="30" y1="90" x2="50" y2="90" stroke="currentColor" strokeWidth="1" opacity="0.3" />
				<line x1="30" y1="70" x2="30" y2="90" stroke="currentColor" strokeWidth="1" opacity="0.3" />
				<m.path
					animate={{
						d: `M 30 ${120 - 30} L ${100 + Math.cos((angle * Math.PI) / 180) * 40} ${120 - 30 - Math.sin((angle * Math.PI) / 180) * 60} L 150 ${120 - 30} Z`,
					}}
					fill="none"
					stroke="var(--tiimo-lavender)"
					strokeWidth="2"
				/>
				<m.path
					animate={{
						d: `M 45 ${120 - 30} A 15 15 0 0 0 ${45 + Math.cos((angle * Math.PI) / 180) * 15} ${120 - 30 - Math.sin((angle * Math.PI) / 180) * 15}`,
					}}
					fill="none"
					stroke="var(--tiimo-orange)"
					strokeWidth="2"
				/>
				<text x="140" y={120 - 20} fontSize="10" fill="currentColor" opacity="0.6">
					B
				</text>
				<text x="45" y={120 - 25} fontSize="10" fill="currentColor" opacity="0.6">
					A
				</text>
				<text x="75" y={120 - 60} fontSize="10" fill="var(--tiimo-lavender)" fontWeight="bold">
					C
				</text>
			</svg>
		</DiagramContainer>
	);
}
