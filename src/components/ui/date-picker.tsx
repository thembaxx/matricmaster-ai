'use client';

import { format } from 'date-fns';
import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DatePickerProps = {
	label?: string;
	htmlFor: string;
	date: string;
	icon?: React.ReactNode;
	setDate: (date: string) => void;
	children?: React.ReactNode;
};

export function DatePicker({
	label = 'Date',
	htmlFor,
	date,
	setDate,
	icon,
	children,
}: DatePickerProps) {
	return (
		<Field className="mx-auto max-w-lg w-full">
			<FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					{children || (
						<Button variant="outline" id={htmlFor} className="justify-start font-normal relative">
							{date ? format(date, 'PPP') : <span>Pick a date</span>}
							{icon && (
								<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
									{icon}
								</div>
							)}
						</Button>
					)}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						id={htmlFor}
						mode="single"
						selected={new Date(date)}
						onSelect={(date) => {
							if (date) setDate(date.toISOString().split('T')[0]);
						}}
						defaultMonth={new Date(date)}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
}
