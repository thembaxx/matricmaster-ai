import { WaveCanvas } from '@/components/ScienceLab/WaveCanvas';
import { WaveControls } from '@/components/ScienceLab/WaveControls';

export default function WavesPage() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<WaveCanvas />
			</div>
			<div>
				<WaveControls />
			</div>
		</div>
	);
}
