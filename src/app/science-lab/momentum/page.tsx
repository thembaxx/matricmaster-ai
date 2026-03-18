import { MomentumCanvas } from '@/components/ScienceLab/MomentumCanvas';
import { MomentumControls } from '@/components/ScienceLab/MomentumControls';

export default function MomentumPage() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<MomentumCanvas />
			</div>
			<div>
				<MomentumControls />
			</div>
		</div>
	);
}
