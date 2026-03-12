'use client';

import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveDiagramProps {
	type: string;
	data?: any;
	className?: string;
}

export function InteractiveDiagram({ type, data, className }: InteractiveDiagramProps) {
	// Simple SVG visualizers based on topic/type
	
	if (type.toLowerCase().includes('parabola') || type.toLowerCase().includes('function')) {
		return (
			<div className={cn("w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4", className)}>
				<svg viewBox="0 0 200 100" className="w-full h-full">
					<line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
					<line x1="100" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
					<m.path
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 1.5, ease: "easeInOut" }}
						d="M 20 80 Q 100 -20 180 80"
						fill="none"
						stroke="var(--tiimo-lavender)"
						strokeWidth="3"
					/>
					<m.circle 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						cx="100" cy="30" r="4" 
						fill="var(--tiimo-green)" 
					/>
				</svg>
			</div>
		);
	}

	if (type.toLowerCase().includes('circuit')) {
		return (
			<div className={cn("w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4", className)}>
				<svg viewBox="0 0 200 100" className="w-full h-full">
					<rect x="40" y="20" width="120" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
					{/* Battery */}
					<line x1="90" y1="20" x2="110" y2="20" stroke="currentColor" strokeWidth="4" />
					<line x1="95" y1="15" x2="105" y2="15" stroke="currentColor" strokeWidth="2" />
					{/* Resistor symbol */}
					<path d="M 40 50 L 55 50 L 60 40 L 70 60 L 80 40 L 90 60 L 95 50 L 110 50" fill="none" stroke="var(--tiimo-orange)" strokeWidth="2" transform="translate(45, 0)" />
					<m.circle
						animate={{ x: [0, 120, 120, 0, 0], y: [0, 0, 60, 60, 0] }}
						transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
						cx="40" cy="20" r="3" fill="var(--tiimo-yellow)"
					/>
				</svg>
			</div>
		);
	}

	// Default fallback for description-based diagrams
	return (
		<div className={cn("w-full p-4 bg-secondary/20 rounded-xl border border-border/50 italic text-sm text-tiimo-gray-muted", className)}>
			[Interactive Diagram: {type}]
		</div>
	);
}
