import { m } from 'framer-motion';
import { useId, useState } from 'react';
import { CircuitDiagram } from '@/components/Science/CircuitDiagram';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InteractiveDiagramProps {
	type:
		| 'force-vector'
		| 'phase-change'
		| 'wave-motion'
		| 'circuit-analysis'
		| 'dna-structure'
		| 'cell-structure'
		| 'projectile-motion'
		| 'momentum-conservation';
	className?: string;
}

export function InteractiveDiagram({ type, className }: InteractiveDiagramProps) {
	if (type === 'force-vector') return <ForceVectorDiagram className={className} />;
	if (type === 'phase-change') return <PhaseChangeDiagram className={className} />;
	if (type === 'wave-motion') return <WaveMotionDiagram className={className} />;
	if (type === 'circuit-analysis') return <CircuitAnalysisDiagram className={className} />;
	if (type === 'dna-structure') return <DnaDiagram className={className} />;
	if (type === 'cell-structure') return <CellDiagram className={className} />;
	if (type === 'projectile-motion') return <ProjectileDiagram className={className} />;
	if (type === 'momentum-conservation') return <MomentumDiagram className={className} />;
	return null;
}

// ... existing ForceVectorDiagram, PhaseChangeDiagram, WaveMotionDiagram ...

function CircuitAnalysisDiagram({ className }: { className?: string }) {
	const voltageId = useId();
	const resistorId = useId();
	const [r1, setR1] = useState(10);
	const [v, setV] = useState(12);

	const elements: any[] = [
		{ id: 'b1', type: 'battery', value: v, position: { x: 50, y: 125 } },
		{ id: 'w1', type: 'wire', value: 100, position: { x: 50, y: 50 } },
		{ id: 'r1', type: 'resistor', value: r1, position: { x: 200, y: 50 } },
		{ id: 'w2', type: 'wire', value: 100, position: { x: 250, y: 125 } },
		{ id: 'l1', type: 'bulb', value: Math.round((v * v) / r1), position: { x: 200, y: 200 } },
	];

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">interactive series circuit</h4>

			<CircuitDiagram elements={elements} />
			<div className="grid grid-cols-2 gap-4 mt-4">
				<div>
					<label
						htmlFor={voltageId}
						className="text-xs font-bold text-muted-foreground block mb-2 lowercase"
					>
						voltage (v)
					</label>

					<Input
						id={voltageId}
						type="range"
						min="1"
						max="24"
						value={v}
						onChange={(e) => setV(Number(e.target.value))}
					/>
				</div>
				<div>
					<label
						htmlFor={resistorId}
						className="text-xs font-bold text-muted-foreground block mb-2 lowercase"
					>
						resistor (Ω)
					</label>

					<Input
						id={resistorId}
						type="range"
						min="1"
						max="50"
						value={r1}
						onChange={(e) => setR1(Number(e.target.value))}
					/>
				</div>
			</div>
			<p className="text-xs text-center mt-4 text-muted-foreground lowercase">
				current (i) = v/r = {(v / r1).toFixed(2)}a
			</p>
		</div>
	);
}

function DnaDiagram({ className }: { className?: string }) {
	const [rotation, setRotation] = useState(0);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">dna double helix</h4>

			<div className="relative h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
				<div className="flex gap-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<m.div
							key={i}
							className="relative w-2 h-40 flex flex-col items-center justify-between"
							animate={{ rotateY: rotation + i * 30 }}
							style={{ transformStyle: 'preserve-3d' }}
						>
							<div className="w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
							<div className="w-1 h-32 bg-white/20" />
							<div className="w-4 h-4 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]" />
						</m.div>
					))}
				</div>
				<div className="absolute bottom-4 left-0 right-0 text-center">
					<p className="text-[10px] text-blue-300 font-mono">rotation: {rotation}°</p>
				</div>
			</div>
			<div className="mt-4">
				<Input
					type="range"
					min="0"
					max="360"
					value={rotation}
					onChange={(e) => setRotation(Number(e.target.value))}
				/>
			</div>
		</div>
	);
}

function CellDiagram({ className }: { className?: string }) {
	const zoomId = useId();
	const [zoom, setZoom] = useState(1);
	const organelles = [
		{ name: 'Nucleus', x: 200, y: 150, r: 40, color: 'bg-indigo-400' },
		{ name: 'Mitochondria', x: 100, y: 100, r: 15, color: 'bg-orange-400' },
		{ name: 'Vacuole', x: 300, y: 200, r: 50, color: 'bg-blue-200' },
		{ name: 'Chloroplast', x: 120, y: 220, r: 20, color: 'bg-green-400' },
	];

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">plant cell structure</h4>

			<div className="relative h-64 bg-green-50/30 rounded-xl overflow-hidden border border-green-100 flex items-center justify-center">
				<m.div className="w-[100%] h-[100%] relative" animate={{ scale: zoom }}>
					{/* Cell Wall */}
					<div className="absolute inset-4 border-8 border-green-600/30 rounded-[2rem] bg-white/40 shadow-inner">
						{organelles.map((o) => (
							<m.div
								key={o.name}
								className={cn(
									'absolute rounded-full shadow-lg flex items-center justify-center text-[8px] font-bold text-white',
									o.color
								)}
								style={{
									left: o.x,
									top: o.y,
									width: o.r * 2,
									height: o.r * 2,
									marginLeft: -o.r,
									marginTop: -o.r,
								}}
								whileHover={{ scale: 1.2 }}
							>
								{o.name}
							</m.div>
						))}
					</div>
				</m.div>
			</div>
			<div className="mt-4">
				<label htmlFor={zoomId} className="text-xs font-bold text-muted-foreground block mb-2">
					microscope zoom
				</label>
				<Input
					id={zoomId}
					type="range"
					min="0.8"
					max="2"
					step="0.1"
					value={zoom}
					onChange={(e) => setZoom(Number(e.target.value))}
				/>
			</div>
		</div>
	);
}

function ProjectileDiagram({ className }: { className?: string }) {
	const angleId = useId();
	const velocityId = useId();
	const [angle, setAngle] = useState(45);
	const [velocity, setVelocity] = useState(20);

	const g = 9.8;
	const rad = (angle * Math.PI) / 180;
	const vx = velocity * Math.cos(rad);
	const vy = velocity * Math.sin(rad);
	const tFlight = (2 * vy) / g;
	const range = vx * tFlight;
	const hMax = (vy * vy) / (2 * g);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">projectile motion</h4>

			<div className="relative h-48 bg-sky-50/50 rounded-xl overflow-hidden border border-sky-100">
				<svg className="w-full h-full" viewBox="0 0 400 200">
					<path
						d={`M 20 180 Q ${20 + range / 2} ${180 - hMax * 4} ${20 + range} 180`}
						fill="none"
						stroke="#0ea5e9"
						strokeWidth="2"
						strokeDasharray="4 4"
					/>
					<circle cx="20" cy="180" r="4" fill="#0369a1" />
					<line
						x1="20"
						y1="180"
						x2={20 + Math.cos(rad) * 40}
						y2={180 - Math.sin(rad) * 40}
						stroke="#f97316"
						strokeWidth="2"
					/>
				</svg>
				<div className="absolute top-2 left-2 text-[10px] space-y-1 bg-white/80 p-2 rounded-lg border border-border/50">
					<p>Range: {range.toFixed(2)}m</p>
					<p>Height: {hMax.toFixed(2)}m</p>
					<p>Flight: {tFlight.toFixed(2)}s</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4 mt-4">
				<div>
					<label htmlFor={angleId} className="text-xs font-bold text-muted-foreground block mb-2">
						angle (°)
					</label>
					<Input
						id={angleId}
						type="range"
						min="10"
						max="80"
						value={angle}
						onChange={(e) => setAngle(Number(e.target.value))}
					/>
				</div>
				<div>
					<label
						htmlFor={velocityId}
						className="text-xs font-bold text-muted-foreground block mb-2"
					>
						velocity (m/s)
					</label>
					<Input
						id={velocityId}
						type="range"
						min="5"
						max="40"
						value={velocity}
						onChange={(e) => setVelocity(Number(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
}

function MomentumDiagram({ className }: { className?: string }) {
	const massId = useId();
	const velocity2Id = useId();
	const [m1, setM1] = useState(2);
	const [v1, setV1] = useState(5);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">momentum (p = mv)</h4>

			<div className="relative h-48 bg-slate-50 rounded-xl overflow-hidden flex items-end justify-center p-8">
				<m.div
					className="bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold"
					animate={{ x: v1 * 20 }}
					style={{ width: m1 * 20, height: m1 * 20 }}
				>
					{m1}kg
				</m.div>
				<div className="absolute bottom-2 left-0 right-0 text-center">
					<p className="text-sm font-bold text-indigo-900">p = {(m1 * v1).toFixed(1)} kg·m/s</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4 mt-4">
				<div>
					<label htmlFor={massId} className="text-xs font-bold text-muted-foreground block mb-2">
						mass (kg)
					</label>
					<Input
						id={massId}
						type="range"
						min="1"
						max="5"
						value={m1}
						onChange={(e) => setM1(Number(e.target.value))}
					/>
				</div>
				<div>
					<label
						htmlFor={velocity2Id}
						className="text-xs font-bold text-muted-foreground block mb-2"
					>
						velocity (m/s)
					</label>
					<Input
						id={velocity2Id}
						type="range"
						min="1"
						max="10"
						value={v1}
						onChange={(e) => setV1(Number(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
}

function ForceVectorDiagram({ className }: { className?: string }) {
	const forceId = useId();
	const [force, setForce] = useState(50);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">interactive force vector</h4>

			<div className="relative h-48 bg-muted/20 rounded-xl flex items-center justify-center overflow-hidden">
				{/* Object */}
				<div className="w-16 h-16 bg-foreground rounded-lg z-10 relative flex items-center justify-center text-background font-bold">
					mass
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
				<label htmlFor={forceId} className="text-xs font-bold  text-muted-foreground block mb-2">
					applied force
				</label>
				<Input
					id={forceId}
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

	if (temp < 0) {
		state = 'Solid (Ice)';
		particles = 'grid';
	} else if (temp >= 0 && temp < 100) {
		state = 'Liquid (Water)';
		particles = 'flow';
	} else {
		state = 'Gas (Steam)';
		particles = 'chaos';
	}

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">phase change: water</h4>

			{/* Simulation Viewport */}
			<div className="relative h-48 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 overflow-hidden mb-4">
				<div className="absolute inset-0 flex items-center justify-center flex-wrap gap-2 p-8 transition-all duration-500">
					{Array.from({ length: 12 }).map((_, i) => (
						<m.div
							key={`particle-${i}`}
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

			<Input
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
	const amplitudeId = useId();
	const frequencyId = useId();
	const [amplitude, setAmplitude] = useState(20);
	const [frequency, setFrequency] = useState(1);

	return (
		<div className={cn('bg-card border border-border/50 rounded-2xl p-6 shadow-sm', className)}>
			<h4 className="font-bold mb-4 text-center lowercase">wave properties</h4>

			<div className="relative h-48 bg-muted/10 rounded-xl flex items-center overflow-hidden mb-4">
				<svg className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
					<title>Wave visualization</title>
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
								key={`wave-${i}`}
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
					<label
						htmlFor={amplitudeId}
						className="text-xs font-bold  text-muted-foreground block mb-2"
					>
						amplitude
					</label>
					<Input
						id={amplitudeId}
						type="range"
						min="0"
						max="50"
						value={amplitude}
						onChange={(e) => setAmplitude(Number(e.target.value))}
					/>
				</div>
				<div>
					<label
						htmlFor={frequencyId}
						className="text-xs font-bold  text-muted-foreground block mb-2"
					>
						frequency
					</label>
					<Input
						id={frequencyId}
						type="range"
						min="0.5"
						max="3"
						step="0.1"
						value={frequency}
						onChange={(e) => setFrequency(Number(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
}
