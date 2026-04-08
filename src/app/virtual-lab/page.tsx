'use client';

import { useState } from 'react';
import { ChemistryBonding } from '@/components/Simulation/ChemistryBonding';
import { GeographyLayerMap } from '@/components/Simulation/GeographyLayerMap';
import { PhysicsLever } from '@/components/Simulation/PhysicsLever';
import { cn } from '@/lib/utils';

type Subject = 'all' | 'chemistry' | 'physics' | 'geography';

const SUBJECTS: { key: Subject; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'chemistry', label: 'Chemistry' },
	{ key: 'physics', label: 'Physics' },
	{ key: 'geography', label: 'Geography' },
];

const SIMULATIONS = [
	{
		id: 'bonding',
		subject: 'chemistry' as const,
		title: 'Chemical Bonding',
		description: 'Combine elements to discover ionic and covalent bonds',
	},
	{
		id: 'lever',
		subject: 'physics' as const,
		title: 'Lever and Torque',
		description: 'Explore how forces and fulcrum position affect balance',
	},
	{
		id: 'map',
		subject: 'geography' as const,
		title: 'South Africa Layers',
		description: 'Toggle political, topographic, and economic map layers',
	},
];

export default function VirtualLabPage() {
	const [filter, setFilter] = useState<Subject>('all');

	const filtered = filter === 'all' ? SIMULATIONS : SIMULATIONS.filter((s) => s.subject === filter);

	return (
		<div className="min-h-screen pb-40">
			<div className="max-w-4xl mx-auto px-4 pt-8">
				<div className="mb-8">
					<h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
						Virtual lab
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Interactive simulations for Grade 12 science
					</p>
				</div>

				<div className="flex gap-2 mb-8">
					{SUBJECTS.map((s) => (
						<button
							key={s.key}
							type="button"
							onClick={() => setFilter(s.key)}
							className={cn(
								'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
								filter === s.key
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
							)}
						>
							{s.label}
						</button>
					))}
				</div>

				<div className="space-y-8">
					{filtered.map((sim) => (
						<div key={sim.id}>
							{sim.id === 'bonding' && <ChemistryBonding />}
							{sim.id === 'lever' && <PhysicsLever />}
							{sim.id === 'map' && <GeographyLayerMap />}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
