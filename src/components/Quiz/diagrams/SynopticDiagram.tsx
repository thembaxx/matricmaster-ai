'use client';

import { m } from 'framer-motion';
import { DiagramContainer } from './DiagramContainer';

interface SynopticDiagramProps {
	className?: string;
}

export function SynopticDiagram({ className }: SynopticDiagramProps) {
	return (
		<DiagramContainer className={className} hideSlider>
			<svg
				viewBox="0 0 200 100"
				className="w-full h-full"
				role="img"
				aria-label="Weather map with isobars"
			>
				<title>Weather map with isobars</title>
				<m.circle
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					cx="100"
					cy="50"
					r="40"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					strokeDasharray="4 2"
				/>
				<m.circle
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					cx="100"
					cy="50"
					r="30"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
				/>
				<m.circle
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					cx="100"
					cy="50"
					r="20"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
				/>

				<text x="95" y="55" fontSize="12" fontWeight="bold" fill="var(--tiimo-lavender)">
					L
				</text>

				<m.path
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					d="M 140 50 Q 160 80 180 100"
					fill="none"
					stroke="var(--tiimo-blue)"
					strokeWidth="3"
				/>
				{[1, 2, 3].map((item) => (
					<m.path
						key={`synoptic-front-${item}`}
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.5 + item * 0.1 }}
						d="M 0 -5 L 5 5 L -5 5 Z"
						fill="var(--tiimo-blue)"
						transform={`translate(${145 + item * 10}, ${55 + item * 15}) rotate(${45})`}
					/>
				))}
			</svg>
		</DiagramContainer>
	);
}
