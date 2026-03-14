'use client';

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type TimePickerProps = {
	htmlFor: string;
	label: string;
	time: string;
	icon?: React.ReactNode;
	setTime: (time: string) => void;
};

export function TimePicker({ htmlFor, label, time, icon, setTime }: TimePickerProps) {
	return (
		<FieldGroup className="mx-auto max-w-lg w-full flex-row">
			<Field className="w-full">
				<FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
				<div className="relative">
					<Input
						type="time"
						id={htmlFor}
						step="1"
						value={time}
						onChange={(e) => setTime(e.target.value)}
						className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
						{icon}
					</div>
				</div>
			</Field>
		</FieldGroup>
	);
}
