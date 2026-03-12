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

	if (type.toLowerCase().includes('synoptic') || type.toLowerCase().includes('cyclone')) {
		return (
			<div className={cn("w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4", className)}>
				<svg viewBox="0 0 200 100" className="w-full h-full">
					{/* Isobars */}
					<m.circle 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						cx="100" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
					<m.circle 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						cx="100" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
					<m.circle 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						cx="100" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
					
					{/* Low Pressure Center */}
					<text x="95" y="55" fontSize="12" fontWeight="bold" fill="var(--tiimo-lavender)">L</text>
					
					{/* Cold Front triangles */}
					<m.path 
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						d="M 140 50 Q 160 80 180 100" 
						fill="none" 
						stroke="var(--tiimo-blue)" 
						strokeWidth="3" />
					{[1, 2, 3].map(i => (
						<m.path 
							key={i}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.5 + i * 0.1 }}
							d="M 0 -5 L 5 5 L -5 5 Z" 
							fill="var(--tiimo-blue)" 
							transform={`translate(${145 + i * 10}, ${55 + i * 15}) rotate(${45})`} />
					))}
				</svg>
			</div>
		);
	}

	if (type.toLowerCase().includes('dna') || type.toLowerCase().includes('helix')) {
		return (
			<div className={cn("w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4", className)}>
				<svg viewBox="0 0 200 100" className="w-full h-full">
					{/* Helix strands */}
					{[0, 1].map(strand => (
						<m.path
							key={strand}
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
							d={`M 20 ${strand === 0 ? 30 : 70} ${Array.from({length: 10}).map((_, i) => 
								`Q ${20 + i * 16 + 8} ${strand === 0 ? (i % 2 === 0 ? 80 : 20) : (i % 2 === 0 ? 20 : 80)} ${20 + (i + 1) * 16} ${strand === 0 ? (i % 2 === 0 ? 70 : 30) : (i % 2 === 0 ? 30 : 70)}`
							).join(' ')}`}
							fill="none"
							stroke={strand === 0 ? "var(--tiimo-lavender)" : "var(--tiimo-green)"}
							strokeWidth="3"
						/>
					))}
					{/* Base pairs */}
					{Array.from({length: 10}).map((_, i) => (
						<m.line
							key={i}
							initial={{ opacity: 0 }}
							animate={{ opacity: [0, 1, 0] }}
							transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
							x1={28 + i * 16} y1="40" x2={28 + i * 16} y2="60"
							stroke="currentColor"
							strokeWidth="1"
							opacity="0.5"
						/>
					))}
				</svg>
			</div>
		);
	}

	if (type.toLowerCase().includes('ledger') || type.toLowerCase().includes('account')) {
		return (
			<div className={cn("w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4", className)}>
				<div className="w-full h-full flex flex-col border-2 border-border rounded-lg bg-card">
					<div className="p-2 border-b-2 border-border text-center font-bold text-xs uppercase tracking-widest bg-muted/50">
						General Ledger: Equipment
					</div>
					<div className="flex-1 flex">
						{/* Debit side */}
						<div className="flex-1 border-r-2 border-border p-2">
							<div className="text-[8px] font-black text-tiimo-gray-muted uppercase mb-2">Debit (Dr)</div>
							<m.div 
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								className="flex justify-between text-[10px] mb-1">
								<span>Bank (Purchase)</span>
								<span className="font-bold text-tiimo-green">R 12,000</span>
							</m.div>
						</div>
						{/* Credit side */}
						<div className="flex-1 p-2 text-right">
							<div className="text-[8px] font-black text-tiimo-gray-muted uppercase mb-2">Credit (Cr)</div>
							<m.div 
								initial={{ opacity: 0, x: 10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5 }}
								className="flex justify-between text-[10px] mb-1">
								<span className="text-destructive font-bold italic opacity-50">?</span>
								<span>Depreciation</span>
							</m.div>
						</div>
					</div>
				</div>
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
