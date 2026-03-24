'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaySelectorProps {
	selectedDays: string[];
	onToggle: (day: string) => void;
}

export function DaySelector({ selectedDays, onToggle }: DaySelectorProps) {
	return (
		<div className="space-y-3">
			<span className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">
				Study Days
			</span>
			<div className="flex flex-wrap gap-2">
				{DAYS.map((day) => (
					<Button
						key={day}
						type="button"
						variant="ghost"
						onClick={() => onToggle(day)}
						className={cn(
							'px-3 py-2 h-auto rounded-xl text-sm font-medium',
							selectedDays.includes(day)
								? 'bg-primary text-primary-foreground shadow-md'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'
						)}
					>
						{day.slice(0, 3)}
					</Button>
				))}
			</div>
		</div>
	);
}
