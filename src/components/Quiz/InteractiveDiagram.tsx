'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InteractiveDiagramProps {
	type: string;
	className?: string;
}

export function InteractiveDiagram({ type, className }: InteractiveDiagramProps) {
	const [parabolaC, setParabolaC] = useState(0);
	const [punnett, setPunnett] = useState<Record<string, string>>({});
	const [angle, setAngle] = useState(30);
	const [radius, setRadius] = useState(40);
	const [vecAngle, setVecAngle] = useState(45);
	const [time, setTime] = useState(0.5);
	const [force, setForce] = useState(50);
	const [wavePhase, setWavePhase] = useState(0);

	// Triangle diagram for trigonometry
	if (
		type.toLowerCase().includes('triangle') ||
		type.toLowerCase().includes('trigonometry') ||
		type.toLowerCase().includes('sine rule') ||
		type.toLowerCase().includes('cosine rule')
	) {
		return (
			<div
				className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}
			>
				<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
					<svg
						viewBox="0 0 200 120"
						className="w-full h-full"
						role="img"
						aria-label="Triangle diagram"
					>
						<title>Triangle for trigonometry</title>
						{/* Right angle marker */}
						<line
							x1="30"
							y1="90"
							x2="50"
							y2="90"
							stroke="currentColor"
							strokeWidth="1"
							opacity="0.3"
						/>
						<line
							x1="30"
							y1="70"
							x2="30"
							y2="90"
							stroke="currentColor"
							strokeWidth="1"
							opacity="0.3"
						/>
						{/* Triangle */}
						<m.path
							animate={{
								d: `M 30 ${120 - 30} L ${100 + Math.cos((angle * Math.PI) / 180) * 40} ${120 - 30 - Math.sin((angle * Math.PI) / 180) * 60} L 150 ${120 - 30} Z`,
							}}
							fill="none"
							stroke="var(--tiimo-lavender)"
							strokeWidth="2"
						/>
						{/* Angle arc */}
						<m.path
							animate={{
								d: `M 45 ${120 - 30} A 15 15 0 0 0 ${45 + Math.cos((angle * Math.PI) / 180) * 15} ${120 - 30 - Math.sin((angle * Math.PI) / 180) * 15}`,
							}}
							fill="none"
							stroke="var(--tiimo-orange)"
							strokeWidth="2"
						/>
						{/* Labels */}
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
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						<span>0°</span>
						<span>Angle θ = {angle}°</span>
						<span>90°</span>
					</div>
					<input
						type="range"
						min="0"
						max="90"
						value={angle}
						onChange={(e) => setAngle(Number.parseInt(e.target.value, 10))}
						className="w-full accent-primary"
					/>
				</div>
			</div>
		);
	}

	// Circle diagram for analytical geometry
	if (type.toLowerCase().includes('circle') || type.toLowerCase().includes('analytical geometry')) {
		return (
			<div
				className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}
			>
				<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
					<svg
						viewBox="0 0 200 120"
						className="w-full h-full"
						role="img"
						aria-label="Circle diagram"
					>
						<title>Circle diagram</title>
						{/* Grid */}
						<line
							x1="100"
							y1="0"
							x2="100"
							y2="120"
							stroke="currentColor"
							strokeWidth="0.5"
							opacity="0.1"
						/>
						<line
							x1="0"
							y1="60"
							x2="200"
							y2="60"
							stroke="currentColor"
							strokeWidth="0.5"
							opacity="0.1"
						/>
						{/* Circle */}
						<m.circle
							animate={{ r: radius }}
							cx="100"
							cy="60"
							fill="none"
							stroke="var(--tiimo-lavender)"
							strokeWidth="2"
						/>
						{/* Radius line */}
						<m.line
							animate={{ x2: 100 + radius }}
							x1="100"
							y1="60"
							x2="100"
							y2="60"
							stroke="var(--tiimo-orange)"
							strokeWidth="2"
						/>
						{/* Center point */}
						<circle cx="100" cy="60" r="3" fill="var(--tiimo-blue)" />
						{/* Label */}
						<text x={100 + radius / 2} y="55" fontSize="10" fill="var(--tiimo-orange)">
							r
						</text>
					</svg>
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						<span>Small</span>
						<span>Radius = {radius}</span>
						<span>Large</span>
					</div>
					<input
						type="range"
						min="10"
						max="55"
						value={radius}
						onChange={(e) => setRadius(Number.parseInt(e.target.value, 10))}
						className="w-full accent-primary"
					/>
				</div>
			</div>
		);
	}

	// Vector diagram
	if (
		type.toLowerCase().includes('vector') ||
		type.toLowerCase().includes('magnitude') ||
		type.toLowerCase().includes('angle between')
	) {
		return (
			<div
				className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}
			>
				<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
					<svg
						viewBox="0 0 200 120"
						className="w-full h-full"
						role="img"
						aria-label="Vector diagram"
					>
						<title>Vector diagram</title>
						{/* Axes */}
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
						{/* Vector arrow */}
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
						{/* Arrow head */}
						<m.path
							animate={{
								d: `M ${100 + Math.cos((vecAngle * Math.PI) / 180) * 60} ${60 - Math.sin((vecAngle * Math.PI) / 180) * 60} L ${100 + Math.cos(((vecAngle + 150) * Math.PI) / 180) * 55} ${60 - Math.sin(((vecAngle + 150) * Math.PI) / 180) * 55} L ${100 + Math.cos(((vecAngle - 150) * Math.PI) / 180) * 55} ${60 - Math.sin(((vecAngle - 150) * Math.PI) / 180) * 55} Z`,
							}}
							fill="var(--tiimo-lavender)"
						/>
						{/* Angle arc */}
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
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						<span>0°</span>
						<span>Angle = {vecAngle}°</span>
						<span>90°</span>
					</div>
					<input
						type="range"
						min="0"
						max="90"
						value={vecAngle}
						onChange={(e) => setVecAngle(Number.parseInt(e.target.value, 10))}
						className="w-full accent-primary"
					/>
				</div>
			</div>
		);
	}

	// Projectile motion diagram
	if (
		type.toLowerCase().includes('projectile') ||
		type.toLowerCase().includes('projectile motion')
	) {
		return (
			<div
				className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}
			>
				<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
					<svg
						viewBox="0 0 200 120"
						className="w-full h-full"
						role="img"
						aria-label="Projectile motion diagram"
					>
						<title>Projectile motion</title>
						{/* Ground */}
						<line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="1" />
						{/* Trajectory parabola */}
						<path
							d="M 10 100 Q 100 20 190 100"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							opacity="0.2"
							strokeDasharray="4 2"
						/>
						{/* Projectile */}
						<m.circle
							animate={{
								cx: 10 + time * 180,
								cy: 100 - 80 * Math.sin(time * Math.PI) * (1 - time),
							}}
							r="5"
							fill="var(--tiimo-lavender)"
						/>
						{/* Velocity vector */}
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
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						<span>Launch</span>
						<span>Time = {(time * 2).toFixed(1)}s</span>
						<span>Land</span>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						value={time * 100}
						onChange={(e) => setTime(Number.parseInt(e.target.value, 10) / 100)}
						className="w-full accent-primary"
					/>
				</div>
			</div>
		);
	}

	// Force diagram (free body diagram)
	if (
		type.toLowerCase().includes('force') ||
		type.toLowerCase().includes('newton') ||
		type.toLowerCase().includes('free body') ||
		type.toLowerCase().includes("newton's second law")
	) {
		return (
			<div
				className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}
			>
				<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
					<svg
						viewBox="0 0 200 120"
						className="w-full h-full"
						role="img"
						aria-label="Force diagram"
					>
						<title>Free body diagram</title>
						{/* Ground */}
						<line x1="40" y1="90" x2="160" y2="90" stroke="currentColor" strokeWidth="1" />
						{/* Block */}
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
						{/* Weight force (down) */}
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
						{/* Applied force (right) */}
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
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						<span>Small</span>
						<span>Force Magnitude</span>
						<span>Large</span>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						value={force}
						onChange={(e) => setForce(Number.parseInt(e.target.value, 10))}
						className="w-full accent-primary"
					/>
				</div>
			</div>
		);
	}

	// Wave diagram
	if (
		type.toLowerCase().includes('wave') ||
		type.toLowerCase().includes('transverse') ||
		type.toLowerCase().includes('longitudinal')
	) {
		return (
			<div
				className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}
			>
				<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
					<svg viewBox="0 0 200 120" className="w-full h-full" role="img" aria-label="Wave diagram">
						<title>Wave motion</title>
						{/* Axis line */}
						<line
							x1="0"
							y1="60"
							x2="200"
							y2="60"
							stroke="currentColor"
							strokeWidth="0.5"
							opacity="0.2"
						/>
						{/* Wave */}
						<m.path
							animate={{
								d: `M 0 60 ${Array.from({ length: 21 }, (_, i) => `L ${i * 10} ${60 - 30 * Math.sin(i * 0.5 + wavePhase * 0.1)}`).join(' ')}`,
							}}
							fill="none"
							stroke="var(--tiimo-lavender)"
							strokeWidth="2"
						/>
						{/* Wavelength indicator */}
						<line x1="20" y1="100" x2="60" y2="100" stroke="var(--tiimo-orange)" strokeWidth="1" />
						<text x="35" y="108" fontSize="8" fill="var(--tiimo-orange)">
							λ
						</text>
						{/* Amplitude indicator */}
						<line x1="170" y1="30" x2="170" y2="90" stroke="var(--tiimo-blue)" strokeWidth="1" />
						<text x="175" y="60" fontSize="8" fill="var(--tiimo-blue)">
							A
						</text>
					</svg>
				</div>
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
						<span>Phase</span>
						<span>Wave Animation</span>
						<span>Shift</span>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						value={wavePhase}
						onChange={(e) => setWavePhase(Number.parseInt(e.target.value, 10))}
						className="w-full accent-primary"
					/>
				</div>
			</div>
		);
	}

	// Simple parabola/function diagram
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
						<Button
							key={cell}
							type="button"
							variant="ghost"
							onClick={() =>
								setPunnett((prev) => ({
									...prev,
									[cell]: prev[cell] === 'TT' ? 'Tt' : prev[cell] === 'Tt' ? 'tt' : 'TT',
								}))
							}
							className="aspect-square bg-card border-2 border-border rounded-xl flex items-center justify-center font-black text-lg hover:border-primary active:scale-95"
						>
							{punnett[cell] || '?'}
						</Button>
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
					{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
					{[1, 2, 3].map((i) => (
						<m.path
							key={`atom-${i}`}
							initial={{ scale: 0.95, opacity: 0 }}
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
