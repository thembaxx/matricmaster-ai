'use client';

import { m } from 'framer-motion';
import { DiagramContainer } from './DiagramContainer';

interface DNADiagramProps {
	className?: string;
}

export function DNADiagram({ className }: DNADiagramProps) {
	return (
		<DiagramContainer className={className} hideSlider>
			<svg
				viewBox="0 0 200 100"
				className="w-full h-full"
				role="img"
				aria-label="DNA double helix structure"
			>
				<title>DNA double helix structure</title>
				{[0, 1].map((strand) => (
					<m.path
						key={strand}
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
						d={strand === 0 ? 'M 20 50 Q 60 0 100 50 T 180 50' : 'M 20 50 Q 60 100 100 50 T 180 50'}
						fill="none"
						stroke={strand === 0 ? 'var(--tiimo-lavender)' : 'var(--tiimo-blue)'}
						strokeWidth="4"
						strokeLinecap="round"
						opacity="0.8"
					/>
				))}
				{[40, 60, 80, 100, 120, 140, 160].map((x) => (
					<line
						key={x}
						x1={x}
						y1={50 + 30 * Math.sin((x / 40) * Math.PI)}
						x2={x}
						y2={50 - 30 * Math.sin((x / 40) * Math.PI)}
						stroke="currentColor"
						strokeWidth="2"
						opacity="0.3"
					/>
				))}
			</svg>
		</DiagramContainer>
	);
}
