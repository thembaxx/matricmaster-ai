'use client';

import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CircuitDiagram } from '@/components/Science/CircuitDiagram';
import { ProjectileMotion } from '@/components/Science/ProjectileMotion';
import { WaveInterference } from '@/components/Science/WaveInterference';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScienceLabPage() {
	const router = useRouter();
	const pathname = usePathname();
	const [circuitParams, setCircuitParams] = useState({ voltage: 12, r1: 4, r2: 6, r3: 3 });

	const activeTab = pathname.split('/').pop() || 'circuits';

	const eqResistance =
		circuitParams.r1 +
		(circuitParams.r2 * circuitParams.r3) / (circuitParams.r2 + circuitParams.r3);
	const current = circuitParams.voltage / eqResistance;

	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-6 bg-card border-b border-border">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
					</Button>
					<h1 className="text-xl font-black">Virtual Science Lab</h1>
				</div>

				<Tabs value={activeTab} onValueChange={(v) => router.push(`/science-lab/${v}`)}>
					<TabsList className="grid grid-cols-5 w-full">
						<TabsTrigger value="circuits">Circuits</TabsTrigger>
						<TabsTrigger value="momentum">Kinematics</TabsTrigger>
						<TabsTrigger value="waves">Waves</TabsTrigger>
						<TabsTrigger value="forces">Forces</TabsTrigger>
						<TabsTrigger value="thermochemistry">Thermo</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<main className="flex-1 p-6 overflow-y-auto pb-40">
				{activeTab === 'circuits' && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div>
							<CircuitDiagram
								elements={[
									{
										id: 'b1',
										type: 'battery',
										value: circuitParams.voltage,
										position: { x: 50, y: 125 },
									},
									{
										id: 'r1',
										type: 'resistor',
										value: circuitParams.r1,
										label: 'R₁',
										position: { x: 150, y: 80 },
									},
									{
										id: 'r2',
										type: 'resistor',
										value: circuitParams.r2,
										label: 'R₂',
										position: { x: 300, y: 125 },
									},
									{
										id: 'r3',
										type: 'resistor',
										value: circuitParams.r3,
										label: 'R₃',
										position: { x: 270, y: 200 },
									},
								]}
							/>
						</div>
						<div className="space-y-4">
							<div className="bg-card rounded-2xl p-6 border border-border">
								<h3 className="font-semibold mb-4">Circuit Parameters</h3>
								<div className="space-y-4">
									<div>
										<label className="text-sm text-muted-foreground">
											Voltage (V)
											<input
												type="range"
												min="1"
												max="24"
												value={circuitParams.voltage}
												onChange={(e) =>
													setCircuitParams({ ...circuitParams, voltage: Number(e.target.value) })
												}
												className="w-full mt-1"
											/>
										</label>
										<span className="font-mono text-sm">{circuitParams.voltage}V</span>
									</div>
									<div>
										<label className="text-sm text-muted-foreground">
											R₁ (Ω)
											<input
												type="range"
												min="1"
												max="20"
												value={circuitParams.r1}
												onChange={(e) =>
													setCircuitParams({ ...circuitParams, r1: Number(e.target.value) })
												}
												className="w-full mt-1"
											/>
										</label>
										<span className="font-mono text-sm">{circuitParams.r1}Ω</span>
									</div>
									<div>
										<label className="text-sm text-muted-foreground">
											R₂ (Ω)
											<input
												type="range"
												min="1"
												max="20"
												value={circuitParams.r2}
												onChange={(e) =>
													setCircuitParams({ ...circuitParams, r2: Number(e.target.value) })
												}
												className="w-full mt-1"
											/>
										</label>
										<span className="font-mono text-sm">{circuitParams.r2}Ω</span>
									</div>
									<div>
										<label className="text-sm text-muted-foreground">
											R₃ (Ω)
											<input
												type="range"
												min="1"
												max="20"
												value={circuitParams.r3}
												onChange={(e) =>
													setCircuitParams({ ...circuitParams, r3: Number(e.target.value) })
												}
												className="w-full mt-1"
											/>
										</label>
										<span className="font-mono text-sm">{circuitParams.r3}Ω</span>
									</div>
								</div>
							</div>
							<div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
								<h3 className="font-semibold mb-4 text-primary">Calculated Values</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-card rounded-xl p-4">
										<div className="text-xs text-muted-foreground">Equivalent R</div>
										<div className="text-xl font-mono font-bold">{eqResistance.toFixed(2)}Ω</div>
									</div>
									<div className="bg-card rounded-xl p-4">
										<div className="text-xs text-muted-foreground">Current</div>
										<div className="text-xl font-mono font-bold">{current.toFixed(2)}A</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'momentum' && <ProjectileMotion />}

				{activeTab === 'waves' && <WaveInterference />}

				{activeTab === 'forces' && (
					<div className="text-center py-20">
						<div className="bg-primary/10 rounded-2xl p-12 border border-primary/20 inline-block">
							<h3 className="text-lg font-semibold mb-4">Forces & Motion Lab</h3>
							<p className="text-muted-foreground mb-4">
								Explore Newton&apos;s laws, gravity, and applied forces.
							</p>
							<Button onClick={() => router.push('/science-lab/forces')} variant="default">
								Open Forces Simulation
							</Button>
						</div>
					</div>
				)}

				{activeTab === 'thermochemistry' && (
					<div className="text-center py-20">
						<div className="bg-primary/10 rounded-2xl p-12 border border-primary/20 inline-block">
							<h3 className="text-lg font-semibold mb-4">Thermochemistry Lab</h3>
							<p className="text-muted-foreground mb-4">
								Explore heat transfer, calorimetry, and chemical energy changes.
							</p>
							<Button onClick={() => router.push('/science-lab/thermochemistry')} variant="default">
								Open Thermochemistry Simulation
							</Button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
