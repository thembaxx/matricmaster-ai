'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveDiagramProps {
	type: 'force-vector' | 'phase-change' | 'wave-motion';
	className?: string;
}

export function InteractiveDiagram({ type, className }: InteractiveDiagramProps) {
	if (type === 'force-vector') return <ForceVectorDiagram className={className} />;
	if (type === 'phase-change') return <PhaseChangeDiagram className={className} />;
	if (type === 'wave-motion') return <WaveMotionDiagram className={className} />;
	return null;
}

function ForceVectorDiagram({ className }: { className?: string }) {
	const [force, setForce] = useState(50);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center">Interactive Force Vector</h4>
			<div className="relative h-48 bg-muted/20 rounded-xl flex items-center justify-center overflow-hidden">
				{/* Object */}
				<div className="w-16 h-16 bg-foreground rounded-lg z-10 relative flex items-center justify-center text-background font-bold">
					Mass
				</div>

				{/* Vector Arrow */}
				<m.div
					className="absolute left-1/2 top-1/2 h-2 bg-primary origin-left rounded-full flex items-center"
					style={{
						width: force * 2,
						x: 32, // Offset from center of mass
					}}
				>
					<div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-t-2 border-r-2 border-primary rotate-45" />
					<span className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap">
						F = {force}N
					</span>
				</m.div>
			</div>

			<div className="mt-4">
				<label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
					Applied Force
				</label>
				<input
					type="range"
					min="0"
					max="100"
					value={force}
					onChange={(e) => setForce(Number(e.target.value))}
					className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
				/>
			</div>
		</div>
	);
}

function PhaseChangeDiagram({ className }: { className?: string }) {
	const [temp, setTemp] = useState(0); // -20 to 120

	// Determine state
	let state = 'Solid';
	let particles = 'grid';
	let speed = 0;

	if (temp < 0) {
		state = 'Solid (Ice)';
		particles = 'grid';
		speed = 0.5;
	} else if (temp >= 0 && temp < 100) {
		state = 'Liquid (Water)';
		particles = 'flow';
		speed = 2 + temp / 20;
	} else {
		state = 'Gas (Steam)';
		particles = 'chaos';
		speed = 10;
	}

	console.debug(speed);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center">Phase Change: Water</h4>

			{/* Simulation Viewport */}
			<div className="relative h-48 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 overflow-hidden mb-4">
				<div className="absolute inset-0 flex items-center justify-center flex-wrap gap-2 p-8 transition-all duration-500">
					{Array.from({ length: 12 }).map((_, i) => (
						<m.div
							key={i}
							className="w-6 h-6 rounded-full bg-blue-400/80 shadow-sm backdrop-blur-sm"
							animate={
								particles === 'grid'
									? { x: 0, y: [0, 2, 0] }
									: particles === 'flow'
										? { x: [0, 10, -10, 0], y: [0, 5, -5, 0] }
										: { x: [0, 50, -50, 20, -20], y: [0, -50, 50, -20, 20], opacity: [0.5, 1, 0.5] }
							}
							transition={{
								duration: particles === 'grid' ? 2 : particles === 'flow' ? 3 : 1,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'linear',
								delay: i * 0.1,
							}}
						/>
					))}
				</div>
				<div className="absolute top-2 right-2 font-mono text-sm font-bold bg-white/80 dark:bg-black/50 px-2 py-1 rounded">
					{temp}°C
				</div>
			</div>

			<div className="flex justify-between items-center mb-2">
				<span className="text-sm font-bold">{state}</span>
			</div>

			<input
				type="range"
				min="-20"
				max="120"
				value={temp}
				onChange={(e) => setTemp(Number(e.target.value))}
				className="w-full accent-blue-500 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
			/>
		</div>
	);
}

function WaveMotionDiagram({ className }: { className?: string }) {
	const [amplitude, setAmplitude] = useState(20);
	const [frequency, setFrequency] = useState(1);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center">Wave Properties</h4>

			<div className="relative h-48 bg-muted/10 rounded-xl flex items-center overflow-hidden mb-4">
				<svg className="w-full h-full" preserveAspectRatio="none">
					<m.path
						d="M0 100 Q 25 100, 50 100 T 100 100 T 150 100 T 200 100 T 250 100 T 300 100 T 350 100 T 400 100"
						fill="none"
						stroke="currentColor"
						strokeWidth="4"
						className="text-primary"
						initial={{ pathLength: 0 }}
						animate={{
							d: `M0 100 Q ${25 / frequency} ${100 - amplitude}, ${50 / frequency} 100 T ${100 / frequency} 100 T ${150 / frequency} 100 T ${200 / frequency} 100 T ${250 / frequency} 100 T ${300 / frequency} 100`,
						}}
						transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: 'linear' }}
					/>
				</svg>
				{/* Simple Sine Wave SVG */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex gap-1">
						{Array.from({ length: 20 }).map((_, i) => (
							<m.div
								key={i}
								className="w-2 h-2 rounded-full bg-primary"
								animate={{ y: [-amplitude, amplitude, -amplitude] }}
								transition={{
									repeat: Number.POSITIVE_INFINITY,
									duration: 2 / frequency,
									ease: 'easeInOut',
									delay: i * 0.1,
								}}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
						Amplitude
					</label>
					<input
						type="range"
						min="0"
						max="50"
						value={amplitude}
						onChange={(e) => setAmplitude(Number(e.target.value))}
						className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
					/>
				</div>
				<div>
					<label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
						Frequency
					</label>
					<input
						type="range"
						min="0.5"
						max="3"
						step="0.1"
						value={frequency}
						onChange={(e) => setFrequency(Number(e.target.value))}
						className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
					/>
				</div>
			</div>
		</div>
	);
}
