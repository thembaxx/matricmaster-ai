'use client';

import { FlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { LoadSheddingSlot } from '@/services/studyPathSchedulerService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const LOAD_SHEDDING_STAGES = [1, 2, 3, 4, 5, 6, 7, 8];

interface LoadSheddingToggleProps {
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
}

export function LoadSheddingToggle({ enabled, onToggle }: LoadSheddingToggleProps) {
	return (
		<div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/30">
			<div className="flex items-center gap-3">
				<HugeiconsIcon icon={FlashIcon} className="h-5 w-5 text-amber-500" />
				<div className="space-y-0.5">
					<span className="text-sm font-bold">Load Shedding</span>
					<p className="text-xs text-muted-foreground">Avoid scheduling during outages</p>
				</div>
			</div>
			<Switch checked={enabled} onCheckedChange={onToggle} />
		</div>
	);
}

interface LoadSheddingSlotsProps {
	slots: LoadSheddingSlot[];
	onAddSlot: () => void;
	onUpdateSlot: (index: number, field: keyof LoadSheddingSlot, value: string | number) => void;
	onRemoveSlot: (index: number) => void;
}

export function LoadSheddingSlots({
	slots,
	onAddSlot,
	onUpdateSlot,
	onRemoveSlot,
}: LoadSheddingSlotsProps) {
	const renderHourOptions = () => {
		return Array.from({ length: 24 }, (_, i) => (
			<option key={`slot-hour-${i}`} value={i}>
				{i.toString().padStart(2, '0')}:00
			</option>
		));
	};

	return (
		<div className="space-y-3 pl-2 border-l-2 border-amber-500/30">
			<div className="flex items-center justify-between">
				<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
					Outage Slots
				</Label>
				<Button
					type="button"
					size="sm"
					variant="outline"
					onClick={onAddSlot}
					className="h-8 rounded-lg text-xs"
				>
					+ Add Slot
				</Button>
			</div>
			{slots.map((slot, index) => (
				<div
					key={`schedule-loadshedding-slot-${index}`}
					className="flex items-center gap-2 bg-muted/50 rounded-xl p-3"
				>
					<select
						value={slot.day}
						onChange={(e) => onUpdateSlot(index, 'day', e.target.value)}
						className="flex-1 h-9 px-3 rounded-lg bg-background text-sm"
					>
						{DAYS.map((d) => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
					<select
						value={slot.startHour}
						onChange={(e) => onUpdateSlot(index, 'startHour', e.target.value)}
						className="w-20 h-9 px-2 rounded-lg bg-background text-sm font-mono"
					>
						{renderHourOptions()}
					</select>
					<span className="text-xs text-muted-foreground">to</span>
					<select
						value={slot.endHour}
						onChange={(e) => onUpdateSlot(index, 'endHour', e.target.value)}
						className="w-20 h-9 px-2 rounded-lg bg-background text-sm font-mono"
					>
						{renderHourOptions()}
					</select>
					<select
						value={slot.stage}
						onChange={(e) => onUpdateSlot(index, 'stage', e.target.value)}
						className="w-16 h-9 px-2 rounded-lg bg-amber-500/10 text-sm text-amber-600"
					>
						{LOAD_SHEDDING_STAGES.map((s) => (
							<option key={s} value={s}>
								S{s}
							</option>
						))}
					</select>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => onRemoveSlot(index)}
						className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-destructive"
					>
						×
					</Button>
				</div>
			))}
		</div>
	);
}
