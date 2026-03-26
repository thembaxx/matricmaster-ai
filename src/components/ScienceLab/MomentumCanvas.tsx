'use client';

import { Card } from '@/components/ui/card';
import { calculateCollision } from '@/lib/physics/momentum';
import { useScienceLab } from '@/stores/useScienceLab';

export function MomentumCanvas() {
	const { momentum } = useScienceLab();
	const results = calculateCollision(
		momentum.mass1,
		momentum.mass2,
		momentum.velocity1,
		momentum.velocity2,
		momentum.collisionType
	);

	return (
		<Card className="relative p-8 min-h-[300px]">
			<svg
				viewBox="0 0 400 200"
				className="w-full h-full"
				role="img"
				aria-label="Momentum collision simulation"
			>
				<title>Collision Simulation</title>
				{/* Ground line */}
				<line x1="20" y1="180" x2="380" y2="180" stroke="currentColor" strokeWidth="2" />

				{/* Object 1 */}
				<circle cx="50" cy="140" r={20 + momentum.mass1 * 3} fill="var(--tiimo-lavender)">
					<animate attributeName="cx" values="50;200;200;50;50" dur="3s" repeatCount="indefinite" />
				</circle>
				<text x="50" y="100" textAnchor="middle" className="text-xs font-bold">
					m<sub>1</sub>={momentum.mass1}kg, v<sub>1</sub>={momentum.velocity1}m/s
				</text>

				{/* Object 2 */}
				<circle cx="350" cy="140" r={20 + momentum.mass2 * 3} fill="var(--tiimo-orange)">
					<animate
						attributeName="cx"
						values="350;200;200;350;350"
						dur="3s"
						repeatCount="indefinite"
					/>
				</circle>
				<text x="350" y="100" textAnchor="middle" className="text-xs font-bold">
					m<sub>2</sub>={momentum.mass2}kg, v<sub>2</sub>={momentum.velocity2}m/s
				</text>
			</svg>

			{/* Results */}
			<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
				<Card className="p-3">
					<p className="font-bold">Before</p>
					<p>p = {results.initialMomentum.toFixed(2)} kg·m/s</p>
					<p>KE = {results.initialKineticEnergy.toFixed(2)} J</p>
				</Card>
				<Card className="p-3">
					<p className="font-bold">After</p>
					<p>p&apos; = {results.finalMomentum.toFixed(2)} kg·m/s</p>
					<p>KE&apos; = {results.finalKineticEnergy.toFixed(2)} J</p>
				</Card>
			</div>
		</Card>
	);
}
