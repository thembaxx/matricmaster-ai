'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface RecurrenceToggleProps {
	id: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export function RecurrenceToggle({ id, checked, onChange }: RecurrenceToggleProps) {
	return (
		<div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/30">
			<div className="flex flex-col gap-0.5">
				<Label htmlFor={id} className="text-sm font-bold">
					Repeat Weekly
				</Label>
				<p className="text-xs text-muted-foreground">Automatically repeat every week</p>
			</div>
			<Switch id={id} checked={checked} onCheckedChange={onChange} />
		</div>
	);
}
