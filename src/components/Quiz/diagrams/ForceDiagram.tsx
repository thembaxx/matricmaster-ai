'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { DiagramContainer } from './DiagramContainer';

interface ForceDiagramProps {
	className?: string;
}

export function ForceDiagram({ className }: ForceDiagramProps) {
	const [force, setForce] = useState(50);

	return (
		<DiagramContainer
			className={className}
			label="Force Magnitude"
			minLabel="Small"
			maxLabel="Large"
			value={force}
			onChange={setForce}
			min={0}
			max={100}
		>
			<svg viewBox="0 0 200 120" className="w-full h-full" role="img" aria-label="Force diagram">
				<title>Free body diagram</title>
				<line x1="40" y1="90" x2="160" y2="90" stroke="currentColor" strokeWidth="1" />
				<rect
					x="70"
					y="60"
					width="60"
					height="30"
					fill="var(--tiimo-lavender)"
					opacity="0.3"
					stroke="var(--tiimo-lavender)"
					strokeWidth="2"
					rx="2"
				/>
				<m.line
					animate={{ y2: 60 + force * 0.6 }}
					x1="100"
					y1="60"
					x2="100"
					y2="60"
					stroke="var(--tiimo-blue)"
					strokeWidth="3"
				/>
				<m.path
					animate={{
						d: `M 95 ${60 + force * 0.4} L 100 ${60 + force * 0.6} L 105 ${60 + force * 0.4}`,
					}}
					fill="none"
					stroke="var(--tiimo-blue)"
					strokeWidth="3"
				/>
				<text x="85" y={60 + force * 0.3} fontSize="8" fill="var(--tiimo-blue)">
					W
				</text>
				<m.line
					animate={{ x2: 130 + force * 0.5 }}
					x1="130"
					y1="75"
					x2="130"
					y2="75"
					stroke="var(--tiimo-orange)"
					strokeWidth="3"
				/>
				<m.path
					animate={{
						d: `M ${130 + force * 0.3} 70 L ${130 + force * 0.5} 75 L ${130 + force * 0.3} 80`,
					}}
					fill="none"
					stroke="var(--tiimo-orange)"
					strokeWidth="3"
				/>
				<text x="135" y="70" fontSize="8" fill="var(--tiimo-orange)">
					F
				</text>
			</svg>
		</DiagramContainer>
	);
}
