'use client';

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';

interface CalendarHeaderProps {
	month: number;
	year: number;
	months: string[];
	prevMonth: () => void;
	nextMonth: () => void;
	goToToday: () => void;
}

export function CalendarHeader({
	month,
	year,
	months,
	prevMonth,
	nextMonth,
	goToToday,
}: CalendarHeaderProps) {
	return (
		<CardHeader className="pb-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
						<HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
					</Button>
					<h2 className="text-xl font-semibold">
						{months[month]} {year}
					</h2>
					<Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
						<HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
					</Button>
				</div>
				<Button variant="outline" onClick={goToToday}>
					Today
				</Button>
			</div>
		</CardHeader>
	);
}
