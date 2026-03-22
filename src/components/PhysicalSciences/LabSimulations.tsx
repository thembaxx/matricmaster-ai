import { CircuitDiagram } from '@/components/Science/CircuitDiagram';
import { FreeBodyDiagram } from '@/components/Science/FreeBodyDiagram';
import { ProjectileMotion } from '@/components/Science/ProjectileMotion';
import { WaveInterference } from '@/components/Science/WaveInterference';
import { Button } from '@/components/ui/button';

interface LabSimulationsProps {
	activeSimulation: 'projectile' | 'forces' | 'waves' | 'circuit';
	setActiveSimulation: (sim: 'projectile' | 'forces' | 'waves' | 'circuit') => void;
}

export function LabSimulations({ activeSimulation, setActiveSimulation }: LabSimulationsProps) {
	return (
		<div className="space-y-6">
			<div className="flex gap-2 overflow-x-auto pb-2">
				<Button
					variant={activeSimulation === 'projectile' ? 'default' : 'outline'}
					size="sm"
					onClick={() => setActiveSimulation('projectile')}
					className="whitespace-nowrap"
				>
					projectile motion
				</Button>
				<Button
					variant={activeSimulation === 'forces' ? 'default' : 'outline'}
					size="sm"
					onClick={() => setActiveSimulation('forces')}
					className="whitespace-nowrap"
				>
					forces (fbd)
				</Button>
				<Button
					variant={activeSimulation === 'waves' ? 'default' : 'outline'}
					size="sm"
					onClick={() => setActiveSimulation('waves')}
					className="whitespace-nowrap"
				>
					wave interference
				</Button>
				<Button
					variant={activeSimulation === 'circuit' ? 'default' : 'outline'}
					size="sm"
					onClick={() => setActiveSimulation('circuit')}
					className="whitespace-nowrap"
				>
					circuit builder
				</Button>
			</div>

			{activeSimulation === 'projectile' && <ProjectileMotion />}
			{activeSimulation === 'forces' && <FreeBodyDiagram />}
			{activeSimulation === 'waves' && <WaveInterference />}
			{activeSimulation === 'circuit' && (
				<CircuitDiagram
					elements={[
						{ id: 'b1', type: 'battery', value: 12, position: { x: 50, y: 125 } },
						{
							id: 'r1',
							type: 'resistor',
							value: 4,
							label: 'R1',
							position: { x: 150, y: 80 },
						},
						{
							id: 'r2',
							type: 'resistor',
							value: 6,
							label: 'R2',
							position: { x: 280, y: 125 },
						},
						{
							id: 'r3',
							type: 'resistor',
							value: 3,
							label: 'R3',
							position: { x: 260, y: 200 },
						},
					]}
				/>
			)}

			<div className="p-4 bg-muted rounded-xl">
				<h4 className="font-semibold text-sm mb-2">how to use these simulations:</h4>
				<ul className="text-xs text-muted-foreground space-y-1">
					<li>• click play/pause to start/stop animations</li>
					<li>• adjust sliders to change parameters</li>
					<li>• click elements to see values</li>
					<li>• use reset to start over</li>
				</ul>
			</div>
		</div>
	);
}
