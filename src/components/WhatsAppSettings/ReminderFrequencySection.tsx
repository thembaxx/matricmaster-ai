import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface ReminderFrequencySectionProps {
	value: string;
	onChange: (value: string) => void;
}

export function ReminderFrequencySection({ value, onChange }: ReminderFrequencySectionProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-medium">Reminder Frequency</h3>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="hourly">Hourly</SelectItem>
					<SelectItem value="twice_daily">Twice Daily</SelectItem>
					<SelectItem value="daily">Daily</SelectItem>
					<SelectItem value="weekly">Weekly</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
