'use client';

import { Calendar04Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';

interface StudyBlockDateTimePickerProps {
	dateId: string;
	startTimeId: string;
	endTimeId: string;
	date: string;
	startTime: string;
	endTime: string;
	onDateChange: (date: string) => void;
	onStartTimeChange: (time: string) => void;
	onEndTimeChange: (time: string) => void;
}

export function StudyBlockDateTimePicker({
	dateId,
	startTimeId,
	endTimeId,
	date,
	startTime,
	endTime,
	onDateChange,
	onStartTimeChange,
	onEndTimeChange,
}: StudyBlockDateTimePickerProps) {
	return (
		<>
			<div className="space-y-2.5">
				<DatePicker
					label="Date"
					htmlFor={dateId}
					date={date}
					setDate={onDateChange}
					icon={<HugeiconsIcon icon={Calendar04Icon} className="h-4 w-4" />}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<TimePicker
					htmlFor={startTimeId}
					label="Start Time"
					time={startTime}
					setTime={onStartTimeChange}
					icon={<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />}
				/>
				<TimePicker
					htmlFor={endTimeId}
					label="End Time"
					time={endTime}
					setTime={onEndTimeChange}
					icon={<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />}
				/>
			</div>
		</>
	);
}
