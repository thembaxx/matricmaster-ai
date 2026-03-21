'use client';

import { useId, useMemo, useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface WaveInterferenceProps {
	frequency?: number;
	amplitude?: number;
	wavelength?: number;
	showSources?: boolean;
}

export function WaveInterference({
	frequency = 1,
	amplitude = 1,
	wavelength = 2,
	showSources = true,
}: WaveInterferenceProps) {
	const [freq, setFreq] = useState(frequency);
	const [amp, setAmp] = useState(amplitude);
	const [phaseShift, setPhaseShift] = useState(0);
	const gradientId = useId();

	const width = 400;
	const height = 300;
	const centerY = height / 2;
	const source1X = 50;
	const source2X = width - 50;

	const waves = useMemo(() => {
		const points: { x: number; y: number; intensity: number }[] = [];
		const k = (2 * Math.PI) / wavelength;
		const omega = 2 * Math.PI * freq;

		for (let x = 0; x <= width; x += 2) {
			const d1 = Math.sqrt((x - source1X) ** 2 + centerY ** 2);
			const d2 = Math.sqrt((x - source2X) ** 2 + centerY ** 2);

			const r1 = amp * Math.sin(k * d1 - omega * (phaseShift / 100));
			const r2 = amp * Math.sin(k * d2 - omega * (phaseShift / 100));
			const y = r1 + r2;
			const intensity = Math.sqrt(r1 ** 2 + r2 ** 2);

			points.push({ x, y, intensity });
		}
		return points;
	}, [freq, amp, wavelength, phaseShift, source2X, centerY]);

	const wavePath = waves
		.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${centerY - p.y * 30}`)
		.join(' ');

	return (
		<div className="bg-card rounded-2xl p-6 border border-border">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-foreground">Wave Interference</h3>
			</div>

			<svg
				width={width}
				height={height}
				className="bg-background rounded-xl w-full"
				role="img"
				aria-label="Wave interference visualization"
			>
				<title>Wave interference pattern from two sources</title>
				<defs>
					<linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
						<stop offset="0%" stopColor="#1E3A5F" />
						<stop offset="50%" stopColor="#3B82F6" />
						<stop offset="100%" stopColor="#1E3A5F" />
					</linearGradient>
				</defs>

				<line
					x1={0}
					y1={centerY}
					x2={width}
					y2={centerY}
					stroke="#666"
					strokeWidth="1"
					strokeDasharray="4"
				/>

				{showSources && (
					<>
						<circle cx={source1X} cy={centerY} r="6" fill="#8B5CF6" />
						<circle cx={source2X} cy={centerY} r="6" fill="#8B5CF6" />
						<text x={source1X} y={centerY - 15} textAnchor="middle" fontSize="10" fill="#8B5CF6">
							S₁
						</text>
						<text x={source2X} y={centerY - 15} textAnchor="middle" fontSize="10" fill="#8B5CF6">
							S₂
						</text>
					</>
				)}

				<path d={wavePath} fill="none" stroke="#06B6D4" strokeWidth="2" />

				{waves
					.filter((_, i) => i % 40 === 0)
					.map((p) => (
						<line
							key={`wave-${p.x}-${p.y}`}
							x1={p.x}
							y1={centerY - p.y * 30 - 5}
							x2={p.x}
							y2={centerY - p.y * 30 + 5}
							stroke="#06B6D4"
							strokeWidth="1"
							opacity="0.5"
						/>
					))}
			</svg>

			<div className="mt-4 space-y-3">
				<div>
					<span className="text-sm text-muted-foreground block mb-1">Frequency: {freq}Hz</span>
					<Slider
						min={0.5}
						max={3}
						step={0.1}
						value={[freq]}
						onValueChange={([v]) => setFreq(v)}
						className="w-full"
					/>
				</div>
				<div>
					<span className="text-sm text-muted-foreground block mb-1">Amplitude: {amp}</span>
					<Slider
						min={0.5}
						max={2}
						step={0.1}
						value={[amp]}
						onValueChange={([v]) => setAmp(v)}
						className="w-full"
					/>
				</div>
				<div>
					<span className="text-sm text-muted-foreground block mb-1">Phase: {phaseShift}°</span>
					<Slider
						min={0}
						max={100}
						value={[phaseShift]}
						onValueChange={([v]) => setPhaseShift(v)}
						className="w-full"
					/>
				</div>
			</div>

			<div className="mt-4 p-3 bg-muted rounded-lg">
				<div className="text-xs text-muted-foreground">
					<strong>Constructive interference:</strong> path difference = nλ (peaks)
				</div>
				<div className="text-xs text-muted-foreground mt-1">
					<strong>Destructive interference:</strong> path difference = (n + ½)λ (cancellations)
				</div>
			</div>
		</div>
	);
}
