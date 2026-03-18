'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useScienceLab } from '@/stores/useScienceLab';

export function WaveControls() {
	const { wave, setWave, resetWave } = useScienceLab();

	return (
		<Card className="p-4 space-y-6">
			<div>
				<Label>Amplitude: {wave.amplitude}</Label>
				<Slider
					value={[wave.amplitude]}
					onValueChange={([v]) => setWave({ amplitude: v })}
					min={0.1}
					max={3}
					step={0.1}
				/>
			</div>

			<div>
				<Label>Frequency: {wave.frequency}Hz</Label>
				<Slider
					value={[wave.frequency]}
					onValueChange={([v]) => setWave({ frequency: v })}
					min={0.5}
					max={5}
					step={0.1}
				/>
			</div>

			<Button variant="outline" onClick={resetWave}>
				Reset
			</Button>
		</Card>
	);
}
