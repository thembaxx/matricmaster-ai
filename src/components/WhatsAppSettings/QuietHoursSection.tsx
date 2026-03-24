import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuietHoursSectionProps {
	startTime: string;
	endTime: string;
	onStartChange: (value: string) => void;
	onEndChange: (value: string) => void;
}

export function QuietHoursSection({
	startTime,
	endTime,
	onStartChange,
	onEndChange,
}: QuietHoursSectionProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-medium">Quiet Hours</h3>
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<Label htmlFor="quietStart">Start</Label>
					<Input
						id="quietStart"
						type="time"
						value={startTime}
						onChange={(e) => onStartChange(e.target.value)}
					/>
				</div>
				<div className="flex-1">
					<Label htmlFor="quietEnd">End</Label>
					<Input
						id="quietEnd"
						type="time"
						value={endTime}
						onChange={(e) => onEndChange(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
}
