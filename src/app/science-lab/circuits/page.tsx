import { CircuitCanvas } from '@/components/ScienceLab/CircuitCanvas';
import { CircuitControls } from '@/components/ScienceLab/CircuitControls';

export default function CircuitsPage() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<CircuitCanvas />
			</div>
			<div>
				<CircuitControls />
			</div>
		</div>
	);
}
