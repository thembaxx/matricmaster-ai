'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useScienceLab } from '@/stores/useScienceLab';

export function CircuitControls() {
	const { circuit, setCircuit, resetCircuit } = useScienceLab();

	return (
		<Card className="p-4 space-y-6">
			<div>
				<Label>Voltage: {circuit.voltage}V</Label>
				<Slider
					value={[circuit.voltage]}
					onValueChange={([v]) => setCircuit({ voltage: v })}
					min={1}
					max={24}
					step={1}
				/>
			</div>

			{circuit.resistors.map((r, i) => (
				<div key={r.id}>
					<Label>
						R{i + 1}: {r.resistance}Ω ({r.config})
					</Label>
					<Slider
						value={[r.resistance]}
						onValueChange={([v]) => {
							const newResistors = [...circuit.resistors];
							newResistors[i] = { ...r, resistance: v };
							setCircuit({ resistors: newResistors });
						}}
						min={1}
						max={100}
						step={1}
					/>
				</div>
			))}

			<Button variant="outline" onClick={resetCircuit}>
				Reset
			</Button>
		</Card>
	);
}
