'use client';

import { motion as m } from 'motion/react';
import { useState } from 'react';
import { DiagramContainer } from './DiagramContainer';

interface VectorDiagramProps {
	className?: string;
}

export function VectorDiagram({ className }: VectorDiagramProps) {
	const [vecAngle, setVecAngle] = useState(45);

	return (
		<DiagramContainer
			className={className}
			label={`Angle = ${vecAngle}°`}
			minLabel="0°"
			maxLabel="90°"
			value={vecAngle}
			onChange={setVecAngle}
			min={0}
			max={90}
		>
			<svg viewBox="0 0 200 120" className="w-full h-full" role="img" aria-label="Vector diagram">
				<title>Vector diagram</title>
				<line
					x1="20"
					y1="60"
					x2="180"
					y2="60"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.2"
				/>
				<line
					x1="100"
					y1="10"
					x2="100"
					y2="110"
					stroke="currentColor"
					strokeWidth="0.5"
					opacity="0.2"
				/>
				<m.line
					animate={{
						x2: 100 + Math.cos((vecAngle * Math.PI) / 180) * 60,
						y2: 60 - Math.sin((vecAngle * Math.PI) / 180) * 60,
					}}
					x1="100"
					y1="60"
					x2="100"
					y2="60"
					stroke="var(--tiimo-lavender)"
					strokeWidth="3"
				/>
				<m.path
					animate={{
						d: `M ${100 + Math.cos((vecAngle * Math.PI) / 180) * 60} ${60 - Math.sin((vecAngle * Math.PI) / 180) * 60} L ${100 + Math.cos(((vecAngle + 150) * Math.PI) / 180) * 55} ${60 - Math.sin(((vecAngle + 150) * Math.PI) / 180) * 55} L ${100 + Math.cos(((vecAngle - 150) * Math.PI) / 180) * 55} ${60 - Math.sin(((vecAngle - 150) * Math.PI) / 180) * 55} Z`,
					}}
					fill="var(--tiimo-lavender)"
				/>
				<m.path
					animate={{
						d: `M 120 60 A 20 20 0 0 0 ${100 + Math.cos((vecAngle * Math.PI) / 180) * 20} ${60 - Math.sin((vecAngle * Math.PI) / 180) * 20}`,
					}}
					fill="none"
					stroke="var(--tiimo-orange)"
					strokeWidth="2"
				/>
				<text x="125" y="55" fontSize="10" fill="var(--tiimo-orange)">
					θ
				</text>
			</svg>
		</DiagramContainer>
	);
}
