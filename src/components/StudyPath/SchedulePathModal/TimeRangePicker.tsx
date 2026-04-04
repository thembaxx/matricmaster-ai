'use client';

import { TimerIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Label } from '@/components/ui/label';

interface TimeRangePickerProps {
	startHour: number;
	endHour: number;
	onStartHourChange: (hour: number) => void;
	onEndHourChange: (hour: number) => void;
}

export function TimeRangePicker({
	startHour,
	endHour,
	onStartHourChange,
	onEndHourChange,
}: TimeRangePickerProps) {
	const renderHourOptions = () => {
		return Array.from({ length: 24 }, (_, i) => (
			<option key={`schedule-option-hour-${i}`} value={i}>
				{i.toString().padStart(2, '0')}:00
			</option>
		));
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div className="space-y-2">
				<Label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">
					Start Time
				</Label>
				<div className="relative">
					<HugeiconsIcon
						icon={TimerIcon}
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					/>
					<select
						value={startHour}
						onChange={(e) => onStartHourChange(Number(e.target.value))}
						className="w-full h-12 pl-10 pr-3 rounded-xl bg-muted border-0 font-mono text-sm focus:ring-2 focus:ring-primary"
					>
						{renderHourOptions()}
					</select>
				</div>
			</div>
			<div className="space-y-2">
				<Label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">
					End Time
				</Label>
				<div className="relative">
					<HugeiconsIcon
						icon={TimerIcon}
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					/>
					<select
						value={endHour}
						onChange={(e) => onEndHourChange(Number(e.target.value))}
						className="w-full h-12 pl-10 pr-3 rounded-xl bg-muted border-0 font-mono text-sm focus:ring-2 focus:ring-primary"
					>
						{renderHourOptions()}
					</select>
				</div>
			</div>
		</div>
	);
}
