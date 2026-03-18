'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useScienceLab } from '@/stores/useScienceLab';

export function MomentumControls() {
	const { momentum, setMomentum, resetMomentum } = useScienceLab();

	return (
		<Card className="p-4 space-y-6">
			<div className="flex items-center justify-between">
				<Label>Elastic Collision</Label>
				<Switch
					checked={momentum.collisionType === 'elastic'}
					onCheckedChange={(checked) =>
						setMomentum({ collisionType: checked ? 'elastic' : 'inelastic' })
					}
				/>
			</div>

			<div>
				<Label>Mass 1: {momentum.mass1}kg</Label>
				<Slider
					value={[momentum.mass1]}
					onValueChange={([v]) => setMomentum({ mass1: v })}
					min={1}
					max={10}
					step={0.5}
				/>
			</div>

			<div>
				<Label>Mass 2: {momentum.mass2}kg</Label>
				<Slider
					value={[momentum.mass2]}
					onValueChange={([v]) => setMomentum({ mass2: v })}
					min={1}
					max={10}
					step={0.5}
				/>
			</div>

			<div>
				<Label>Velocity 1: {momentum.velocity1}m/s</Label>
				<Slider
					value={[momentum.velocity1]}
					onValueChange={([v]) => setMomentum({ velocity1: v })}
					min={-10}
					max={10}
					step={0.5}
				/>
			</div>

			<div>
				<Label>Velocity 2: {momentum.velocity2}m/s</Label>
				<Slider
					value={[momentum.velocity2]}
					onValueChange={([v]) => setMomentum({ velocity2: v })}
					min={-10}
					max={10}
					step={0.5}
				/>
			</div>

			<Button variant="outline" onClick={resetMomentum}>
				Reset
			</Button>
		</Card>
	);
}
