'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveDiagramProps {
	type: string;
	data?: Record<string, any>;
	className?: string;
}

export function InteractiveDiagram({ type, className }: InteractiveDiagramProps) {
	const [parabolaC, setParabolaC] = useState(0);
	const [punnett, setPunnett] = useState<Record<string, string>>({});

	// Simple SVG visualizers based on topic/type

	if (type.toLowerCase().includes('parabola') || type.toLowerCase().includes('function')) {
		return (
			<div
				className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}
			>
				<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
					<svg
						viewBox="0 0 200 100"
						className="w-full h-full"
						role="img"
						aria-label="Parabola graph"
					>
						<title>Parabola graph</title>
						<line
							x1="0"
							y1="50"
							x2="200"
							y2="50"
							stroke="currentColor"
							strokeWidth="0.5"
							opacity="0.2"
						/>
						<line
							x1="100"
							y1="0"
							x2="100"
							y2="100"
							stroke="currentColor"
							strokeWidth="0.5"
							opacity="0.2"
						/>
						{/* y = x^2 + c */}
						<m.path
							animate={{
								d: `M 20 ${80 - parabolaC} Q 100 ${-20 - parabolaC} 180 ${80 - parabolaC}`,
							}}
							fill="none"
							stroke="var(--tiimo-lavender)"
							strokeWidth="3"
						/>
					</svg>
					<div className="absolute top-4 right-6 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
						<span className="text-[10px] font-black font-mono text-primary uppercase">
							y = x² + {parabolaC}
						</span>
					</div>
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						<span>Down</span>
						<span>Vertical Shift (c)</span>
						<span>Up</span>
					</div>
					<input
						type="range"
						min="-40"
						max="40"
						value={parabolaC}
						onChange={(e) => setParabolaC(Number.parseInt(e.target.value, 10))}
						className="w-full accent-primary"
					/>
				</div>
			</div>
		);
	}

	// Life Sciences: Punnett Square Builder
	if (type.toLowerCase().includes('punnett') || type.toLowerCase().includes('genetic')) {
		const cells = ['TL', 'TR', 'BL', 'BR'];
		return (
			<div
				className={cn(
					'w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col items-center gap-6',
					className
				)}
			>
				<div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
					<div />
					<div className="flex items-center justify-center font-black text-primary">T</div>
					<div className="flex items-center justify-center font-black text-primary">t</div>
					<div className="flex items-center justify-center font-black text-primary py-4">T</div>
					{cells.map((cell) => (
						<button
							key={cell}
							type="button"
							onClick={() =>
								setPunnett((prev) => ({
									...prev,
									[cell]: prev[cell] === 'TT' ? 'Tt' : prev[cell] === 'Tt' ? 'tt' : 'TT',
								}))
							}
							className="aspect-square bg-card border-2 border-border rounded-xl flex items-center justify-center font-black text-lg hover:border-primary transition-all active:scale-95"
						>
							{punnett[cell] || '?'}
						</button>
					))}
					<div className="flex items-center justify-center font-black text-primary py-4">t</div>
				</div>
				<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
					Tap cells to cycle alleles (T/t)
				</p>
			</div>
		);
	}

	if (type.toLowerCase().includes('circuit')) {
		return (
			<div
				className={cn(
					'w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4',
					className
				)}
			>
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
					{/* Battery */}
					<line x1="90" y1="20" x2="110" y2="20" stroke="currentColor" strokeWidth="4" />
					<line x1="95" y1="15" x2="105" y2="15" stroke="currentColor" strokeWidth="2" />
					{/* Resistor symbol */}
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
			</div>
		);
	}

	if (type.toLowerCase().includes('synoptic') || type.toLowerCase().includes('cyclone')) {
		return (
			<div
				className={cn(
					'w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4',
					className
				)}
			>
				<svg
					viewBox="0 0 200 100"
					className="w-full h-full"
					role="img"
					aria-label="Weather map with isobars"
				>
					<title>Weather map with isobars</title>
					{/* Isobars */}
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

					{/* Low Pressure Center */}
					<text x="95" y="55" fontSize="12" fontWeight="bold" fill="var(--tiimo-lavender)">
						L
					</text>

					{/* Cold Front triangles */}
					<m.path
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						d="M 140 50 Q 160 80 180 100"
						fill="none"
						stroke="var(--tiimo-blue)"
						strokeWidth="3"
					/>
					{[1, 2, 3].map((i) => (
						<m.path
							key={i}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.5 + i * 0.1 }}
							d="M 0 -5 L 5 5 L -5 5 Z"
							fill="var(--tiimo-blue)"
							transform={`translate(${145 + i * 10}, ${55 + i * 15}) rotate(${45})`}
						/>
					))}
				</svg>
			</div>
		);
	}

	if (type.toLowerCase().includes('dna') || type.toLowerCase().includes('helix')) {
		return (
			<div
				className={cn(
					'w-full h-48 bg-secondary/30 rounded-xl relative overflow-hidden p-4',
					className
				)}
			>
				<svg
					viewBox="0 0 200 100"
					className="w-full h-full"
					role="img"
					aria-label="DNA double helix structure"
				>
					<title>DNA double helix structure</title>
					{/* Helix strands */}
					{[0, 1].map((strand) => (
						<m.path
							key={strand}
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
							d={
								strand === 0 ? 'M 20 50 Q 60 0 100 50 T 180 50' : 'M 20 50 Q 60 100 100 50 T 180 50'
							}
							fill="none"
							stroke={strand === 0 ? 'var(--tiimo-lavender)' : 'var(--tiimo-blue)'}
							strokeWidth="4"
							strokeLinecap="round"
							opacity="0.8"
						/>
					))}
					{/* Nucleotide rungs */}
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
			</div>
		);
	}

	return <div className={cn('w-full aspect-video bg-secondary/30 rounded-xl', className)} />;
}
