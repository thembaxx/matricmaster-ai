'use client';

import { calculateCircuit } from '@/lib/physics/circuits';
import { useScienceLab } from '@/stores/useScienceLab';

export function CircuitCanvas() {
	const { circuit } = useScienceLab();
	const results = calculateCircuit(circuit.voltage, circuit.resistors);

	return (
		<div className="relative bg-card rounded-2xl p-8 min-h-[400px]">
			<svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label="Circuit diagram">
				<title>Circuit Diagram</title>
				{/* Battery */}
				<rect
					x="20"
					y="130"
					width="40"
					height="40"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<text x="40" y="155" textAnchor="middle" className="text-xs fill-current font-mono">
					{circuit.voltage}V
				</text>

				{/* Wires */}
				<line x1="60" y1="150" x2="120" y2="150" stroke="currentColor" strokeWidth="2" />
				<line x1="120" y1="150" x2="120" y2="80" stroke="currentColor" strokeWidth="2" />
				<line x1="120" y1="80" x2="280" y2="80" stroke="currentColor" strokeWidth="2" />
				<line x1="280" y1="80" x2="280" y2="150" stroke="currentColor" strokeWidth="2" />
				<line x1="280" y1="150" x2="340" y2="150" stroke="currentColor" strokeWidth="2" />
				<line x1="340" y1="150" x2="340" y2="220" stroke="currentColor" strokeWidth="2" />
				<line x1="340" y1="220" x2="200" y2="220" stroke="currentColor" strokeWidth="2" />
				<line x1="200" y1="220" x2="60" y2="220" stroke="currentColor" strokeWidth="2" />
				<line x1="60" y1="220" x2="60" y2="170" stroke="currentColor" strokeWidth="2" />

				{/* Resistor 1 - Series */}
				<rect
					x="140"
					y="70"
					width="40"
					height="20"
					fill="var(--tiimo-orange)"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<text x="160" y="60" textAnchor="middle" className="text-xs fill-current font-bold">
					R<sub>1</sub> = {circuit.resistors[0].resistance}Ω
				</text>

				{/* Resistor 2 - Parallel */}
				<rect
					x="260"
					y="140"
					width="20"
					height="40"
					fill="var(--tiimo-orange)"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<text x="290" y="165" textAnchor="start" className="text-xs fill-current font-bold">
					R<sub>2</sub> = {circuit.resistors[1].resistance}Ω
				</text>

				{/* Resistor 3 - Series */}
				<rect
					x="240"
					y="210"
					width="40"
					height="20"
					fill="var(--tiimo-orange)"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<text x="260" y="250" textAnchor="middle" className="text-xs fill-current font-bold">
					R<sub>3</sub> = {circuit.resistors[2].resistance}Ω
				</text>

				{/* Animated electron flow - current indicator */}
				<circle r="4" fill="var(--tiimo-blue)">
					<animateMotion
						dur="2s"
						repeatCount="indefinite"
						path="M60,150 L120,150 L120,80 L280,80 L280,150 L340,150 L340,220 L200,220 L60,220 L60,150"
					/>
				</circle>
			</svg>

			{/* Results overlay */}
			<div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-4 rounded-xl border">
				<div className="text-sm">
					<p>
						<span className="font-bold">R_eq:</span> {results.equivalentResistance.toFixed(2)}Ω
					</p>
					<p>
						<span className="font-bold">I_total:</span> {results.totalCurrent.toFixed(2)}A
					</p>
				</div>
			</div>
		</div>
	);
}
