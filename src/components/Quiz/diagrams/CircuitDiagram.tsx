'use client';

import { motion as m } from 'motion/react';
import { DiagramContainer } from './DiagramContainer';

interface CircuitDiagramProps {
	className?: string;
}

export function CircuitDiagram({ className }: CircuitDiagramProps) {
	return (
		<DiagramContainer className={className} hideSlider>
			<svg
				viewBox="0 0 200 100"
				className="w-full h-full"
				role="img"
				aria-label="Electric circuit diagram"
			>
				<title>Electric circuit diagram</title>
				<rect
					x="40"
					y="20"
					width="120"
					height="60"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<line x1="90" y1="20" x2="110" y2="20" stroke="currentColor" strokeWidth="4" />
				<line x1="95" y1="15" x2="105" y2="15" stroke="currentColor" strokeWidth="2" />
				<path
					d="M 40 50 L 55 50 L 60 40 L 70 60 L 80 40 L 90 60 L 95 50 L 110 50"
					fill="none"
					stroke="var(--tiimo-orange)"
					strokeWidth="2"
					transform="translate(45, 0)"
				/>
				<m.circle
					animate={{ x: [0, 120, 120, 0, 0], y: [0, 0, 60, 60, 0] }}
					transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
					cx="40"
					cy="20"
					r="3"
					fill="var(--tiimo-yellow)"
				/>
			</svg>
		</DiagramContainer>
	);
}
