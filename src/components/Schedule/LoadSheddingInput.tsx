'use client';

import { FlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { LoadSheddingSlot } from '@/services/studyPathSchedulerService';

interface LoadSheddingInputProps {
	slots: LoadSheddingSlot[];
	onChange: (slots: LoadSheddingSlot[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const LOAD_SHEDDING_STAGES = [1, 2, 3, 4, 5, 6, 7, 8];

const SA_ZONES = [
	{ id: 'gauteng', name: 'Gauteng', areas: ['Ekurhuleni', 'Johannesburg', 'Tshwane'] },
	{ id: 'cape-town', name: 'Cape Town', areas: ['City of Cape Town'] },
	{ id: 'durban', name: 'KwaZulu-Natal', areas: ['eThekwini', 'iLembe', 'uMgungundlovu'] },
	{ id: 'nelson-mandela', name: 'Eastern Cape', areas: ['Nelson Mandela Bay'] },
	{ id: 'free-state', name: 'Free State', areas: ['Mangaung', 'Thabo Mofutsanyana'] },
	{ id: 'other', name: 'Other Areas', areas: ['Manual Entry'] },
];

function renderHourOptions() {
	return Array.from({ length: 24 }, (_, i) => (
		<option key={`loadshedding-option-hour-${i}`} value={i}>
			{i.toString().padStart(2, '0')}:00
		</option>
	));
}

export function LoadSheddingInput({ slots, onChange }: LoadSheddingInputProps) {
	const [selectedZone, setSelectedZone] = useState<string | null>(null);

	const addSlot = () => {
		onChange([...slots, { day: 'Monday', startHour: 18, endHour: 20, stage: 2 }]);
	};

	const updateSlot = (index: number, field: keyof LoadSheddingSlot, value: string | number) => {
		const updated = slots.map((slot, i) =>
			i === index
				? { ...slot, [field]: field === 'day' || field === 'stage' ? value : Number(value) }
				: slot
		);
		onChange(updated);
	};

	const removeSlot = (index: number) => {
		onChange(slots.filter((_, i) => i !== index));
	};

	const applyPreset = (zoneId: string) => {
		setSelectedZone(zoneId);
		if (zoneId === 'other') {
			return;
		}

		const presets: Record<string, LoadSheddingSlot[]> = {
			gauteng: [
				{ day: 'Monday', startHour: 18, endHour: 20, stage: 2 },
				{ day: 'Wednesday', startHour: 20, endHour: 22, stage: 2 },
				{ day: 'Friday', startHour: 22, endHour: 24, stage: 2 },
			],
			'cape-town': [
				{ day: 'Tuesday', startHour: 18, endHour: 20, stage: 2 },
				{ day: 'Thursday', startHour: 20, endHour: 22, stage: 2 },
				{ day: 'Saturday', startHour: 22, endHour: 24, stage: 2 },
			],
			durban: [
				{ day: 'Monday', startHour: 20, endHour: 22, stage: 2 },
				{ day: 'Wednesday', startHour: 18, endHour: 20, stage: 2 },
				{ day: 'Friday', startHour: 20, endHour: 22, stage: 2 },
			],
			'nelson-mandela': [
				{ day: 'Tuesday', startHour: 18, endHour: 20, stage: 2 },
				{ day: 'Thursday', startHour: 20, endHour: 22, stage: 2 },
				{ day: 'Saturday', startHour: 18, endHour: 20, stage: 2 },
			],
			'free-state': [
				{ day: 'Monday', startHour: 18, endHour: 20, stage: 2 },
				{ day: 'Thursday', startHour: 18, endHour: 20, stage: 2 },
				{ day: 'Saturday', startHour: 20, endHour: 22, stage: 2 },
			],
		};

		onChange(presets[zoneId] || []);
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">
					Quick Setup by Area
				</Label>
				<div className="grid grid-cols-2 gap-2">
					{SA_ZONES.map((zone) => (
						<Button
							key={zone.id}
							type="button"
							variant="ghost"
							onClick={() => applyPreset(zone.id)}
							className={cn(
								'p-3 h-auto rounded-xl text-left transition-all border',
								selectedZone === zone.id
									? 'bg-amber-500/10 border-amber-500/30 text-amber-700'
									: 'bg-muted/50 border-transparent hover:border-border'
							)}
						>
							<span className="text-sm font-medium block">{zone.name}</span>
							<span className="text-xs text-muted-foreground">{zone.areas[0]}</span>
						</Button>
					))}
				</div>
			</div>

			<div className="flex items-center gap-2">
				<div className="flex-1 h-px bg-border" />
				<span className="text-xs text-muted-foreground">or</span>
				<div className="flex-1 h-px bg-border" />
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label className="text-xs font-bold  tracking-wider text-muted-foreground ml-1">
						Manual Entry
					</Label>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={addSlot}
						className="h-8 rounded-lg text-xs gap-1"
					>
						<HugeiconsIcon icon={FlashIcon} className="h-3 w-3" />
						Add Slot
					</Button>
				</div>

				{slots.length === 0 && (
					<p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-xl">
						No outage slots added. Click + to add manually or select an area above.
					</p>
				)}

				<div className="space-y-2 max-h-48 overflow-y-auto">
					{slots.map((slot) => (
						<div
							key={`slot-${slot.day}-${slot.startHour}-${slot.endHour}-${slot.stage}`}
							className="flex items-center gap-2 bg-muted/50 rounded-xl p-3"
						>
							<select
								value={slot.day}
								onChange={(e) => updateSlot(slots.indexOf(slot), 'day', e.target.value)}
								className="flex-1 h-9 px-3 rounded-lg bg-background text-sm border-0"
							>
								{DAYS.map((d) => (
									<option key={d} value={d}>
										{d.slice(0, 3)}
									</option>
								))}
							</select>
							<select
								value={slot.startHour}
								onChange={(e) => updateSlot(slots.indexOf(slot), 'startHour', e.target.value)}
								className="w-20 h-9 px-2 rounded-lg bg-background text-sm font-mono border-0"
							>
								{renderHourOptions()}
							</select>
							<span className="text-xs text-muted-foreground">-</span>
							<select
								value={slot.endHour}
								onChange={(e) => updateSlot(slots.indexOf(slot), 'endHour', e.target.value)}
								className="w-20 h-9 px-2 rounded-lg bg-background text-sm font-mono border-0"
							>
								{renderHourOptions()}
							</select>
							<select
								value={slot.stage}
								onChange={(e) => updateSlot(slots.indexOf(slot), 'stage', e.target.value)}
								className="w-16 h-9 px-2 rounded-lg bg-amber-500/10 text-sm text-amber-600 border-0 font-mono"
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
								onClick={() => removeSlot(slots.indexOf(slot))}
								className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive"
							>
								×
							</Button>
						</div>
					))}
				</div>
			</div>

			{slots.length > 0 && (
				<div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
					<div className="flex items-center gap-2 mb-2">
						<HugeiconsIcon icon={FlashIcon} className="h-4 w-4 text-amber-600" />
						<span className="text-xs font-semibold text-amber-700">
							{slots.length} slot{slots.length > 1 ? 's' : ''} configured
						</span>
					</div>
					<p className="text-xs text-amber-700/80">
						Your study blocks will be scheduled around these times.
					</p>
				</div>
			)}
		</div>
	);
}
