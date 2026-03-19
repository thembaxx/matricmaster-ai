'use client';

import {
	AlarmClockIcon,
	Calendar02Icon,
	FlashIcon,
	InformationCircleIcon,
	TimerIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type {
	AvailableHours,
	LoadSheddingSlot,
	PathScheduleResult,
	StudyStep,
} from '@/services/studyPathSchedulerService';

interface SchedulePathModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	steps: StudyStep[];
	pathTitle: string;
	onScheduleGenerated?: (result: PathScheduleResult) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LOAD_SHEDDING_STAGES = [1, 2, 3, 4, 5, 6, 7, 8];

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(true);

	if (typeof window !== 'undefined') {
		const check = () => setMatches(window.matchMedia(query).matches);
		check();
	}

	return matches;
}

export function SchedulePathModal({
	open,
	onOpenChange,
	steps,
	pathTitle,
	onScheduleGenerated,
}: SchedulePathModalProps) {
	const isDesktop = useMediaQuery('(min-width: 1024px)');

	const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
	const [startHour, setStartHour] = useState(16);
	const [endHour, setEndHour] = useState(21);
	const [includeLoadShedding, setIncludeLoadShedding] = useState(false);
	const [loadSheddingSlots, setLoadSheddingSlots] = useState<LoadSheddingSlot[]>([]);
	const [scheduleResult, setScheduleResult] = useState<PathScheduleResult | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	const totalMinutes = steps.reduce((sum, s) => sum + s.durationMinutes, 0);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	const toggleDay = (day: string) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const addLoadSheddingSlot = () => {
		setLoadSheddingSlots((prev) => [
			...prev,
			{ day: 'Monday', startHour: 18, endHour: 20, stage: 2 },
		]);
	};

	const updateLoadSheddingSlot = (
		index: number,
		field: keyof LoadSheddingSlot,
		value: string | number
	) => {
		setLoadSheddingSlots((prev) =>
			prev.map((slot, i) =>
				i === index ? { ...slot, [field]: field === 'day' ? value : Number(value) } : slot
			)
		);
	};

	const removeLoadSheddingSlot = (index: number) => {
		setLoadSheddingSlots((prev) => prev.filter((_, i) => i !== index));
	};

	const generateSchedule = async () => {
		if (selectedDays.length === 0) return;

		setIsGenerating(true);
		try {
			const availableHours: AvailableHours[] = selectedDays.map((day) => ({
				day,
				startHour,
				endHour,
			}));

			const response = await fetch('/api/study-path/schedule', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pathId: 'temp',
					steps,
					availableHours,
					loadSheddingSchedule: includeLoadShedding ? loadSheddingSlots : undefined,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setScheduleResult(data);
				setShowPreview(true);
				onScheduleGenerated?.(data);
			}
		} catch (error) {
			console.error('Failed to generate schedule:', error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleAccept = () => {
		if (scheduleResult) {
			onScheduleGenerated?.(scheduleResult);
			onOpenChange(false);
			resetForm();
		}
	};

	const resetForm = () => {
		setScheduleResult(null);
		setShowPreview(false);
	};

	const renderHourOptions = () => {
		return Array.from({ length: 24 }, (_, i) => (
			<option key={i} value={i}>
				{i.toString().padStart(2, '0')}:00
			</option>
		));
	};

	const modalContent = (
		<div className="space-y-6">
			{!showPreview ? (
				<>
					<div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
						<div className="flex items-center gap-2 mb-2">
							<HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-primary" />
							<span className="text-sm font-semibold">Schedule Summary</span>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-background/80 rounded-xl p-3">
								<p className="text-xs text-muted-foreground mb-1">Total Steps</p>
								<p className="font-mono font-bold text-lg">{steps.length}</p>
							</div>
							<div className="bg-background/80 rounded-xl p-3">
								<p className="text-xs text-muted-foreground mb-1">Est. Time</p>
								<p className="font-mono font-bold text-lg">
									{hours}h {minutes}m
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
							Study Days
						</Label>
						<div className="flex flex-wrap gap-2">
							{DAYS.map((day) => (
								<button
									key={day}
									type="button"
									onClick={() => toggleDay(day)}
									className={cn(
										'px-3 py-2 rounded-xl text-sm font-medium transition-all',
										selectedDays.includes(day)
											? 'bg-primary text-primary-foreground shadow-md'
											: 'bg-muted text-muted-foreground hover:bg-muted/80'
									)}
								>
									{day.slice(0, 3)}
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
								Start Time
							</Label>
							<div className="relative">
								<HugeiconsIcon
									icon={TimerIcon}
									className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
								/>
								<select
									value={startHour}
									onChange={(e) => setStartHour(Number(e.target.value))}
									className="w-full h-12 pl-10 pr-3 rounded-xl bg-muted border-0 font-mono text-sm focus:ring-2 focus:ring-primary"
								>
									{renderHourOptions()}
								</select>
							</div>
						</div>
						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
								End Time
							</Label>
							<div className="relative">
								<HugeiconsIcon
									icon={TimerIcon}
									className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
								/>
								<select
									value={endHour}
									onChange={(e) => setEndHour(Number(e.target.value))}
									className="w-full h-12 pl-10 pr-3 rounded-xl bg-muted border-0 font-mono text-sm focus:ring-2 focus:ring-primary"
								>
									{renderHourOptions()}
								</select>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/30">
						<div className="flex items-center gap-3">
							<HugeiconsIcon icon={FlashIcon} className="h-5 w-5 text-amber-500" />
							<div className="space-y-0.5">
								<span className="text-sm font-bold">Load Shedding</span>
								<p className="text-xs text-muted-foreground">Avoid scheduling during outages</p>
							</div>
						</div>
						<Switch checked={includeLoadShedding} onCheckedChange={setIncludeLoadShedding} />
					</div>

					{includeLoadShedding && (
						<div className="space-y-3 pl-2 border-l-2 border-amber-500/30">
							<div className="flex items-center justify-between">
								<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
									Outage Slots
								</Label>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={addLoadSheddingSlot}
									className="h-8 rounded-lg text-xs"
								>
									+ Add Slot
								</Button>
							</div>
							{loadSheddingSlots.map((slot, index) => (
								<div key={index} className="flex items-center gap-2 bg-muted/50 rounded-xl p-3">
									<select
										value={slot.day}
										onChange={(e) => updateLoadSheddingSlot(index, 'day', e.target.value)}
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
										onChange={(e) => updateLoadSheddingSlot(index, 'startHour', e.target.value)}
										className="w-20 h-9 px-2 rounded-lg bg-background text-sm font-mono"
									>
										{renderHourOptions()}
									</select>
									<span className="text-xs text-muted-foreground">to</span>
									<select
										value={slot.endHour}
										onChange={(e) => updateLoadSheddingSlot(index, 'endHour', e.target.value)}
										className="w-20 h-9 px-2 rounded-lg bg-background text-sm font-mono"
									>
										{renderHourOptions()}
									</select>
									<select
										value={slot.stage}
										onChange={(e) => updateLoadSheddingSlot(index, 'stage', e.target.value)}
										className="w-16 h-9 px-2 rounded-lg bg-amber-500/10 text-sm text-amber-600"
									>
										{LOAD_SHEDDING_STAGES.map((s) => (
											<option key={s} value={s}>
												S{s}
											</option>
										))}
									</select>
									<button
										type="button"
										onClick={() => removeLoadSheddingSlot(index)}
										className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive"
									>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</>
			) : (
				<div className="space-y-4">
					<div className="bg-success-soft rounded-2xl p-4 border border-success/20">
						<div className="flex items-center gap-2 mb-2">
							<HugeiconsIcon icon={Calendar02Icon} className="h-5 w-5 text-success" />
							<span className="font-semibold">Schedule Preview</span>
						</div>
						<p className="text-sm text-muted-foreground">
							{scheduleResult?.estimatedDays} days | {hours}h {minutes}m total
						</p>
					</div>

					<div className="max-h-64 overflow-y-auto space-y-2">
						{scheduleResult?.blocks.slice(0, 6).map((block, index) => (
							<div key={block.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
								<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
									<span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{block.topic}</p>
									<p className="text-xs text-muted-foreground">
										{new Date(block.date).toLocaleDateString('en-ZA', {
											weekday: 'short',
											day: 'numeric',
										})}{' '}
										· {block.startTime}
									</p>
								</div>
								<Badge variant="outline" className="font-mono text-xs">
									{block.duration}m
								</Badge>
							</div>
						))}
						{scheduleResult && scheduleResult.blocks.length > 6 && (
							<p className="text-xs text-muted-foreground text-center py-2">
								+{scheduleResult.blocks.length - 6} more blocks
							</p>
						)}
					</div>

					{scheduleResult?.conflicts && scheduleResult.conflicts.length > 0 && (
						<div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
							<div className="flex items-center gap-2 mb-2">
								<HugeiconsIcon icon={AlarmClockIcon} className="h-4 w-4 text-amber-600" />
								<span className="text-sm font-semibold text-amber-700">
									{scheduleResult.conflicts.length} Adjustment
									{scheduleResult.conflicts.length > 1 ? 's' : ''}
								</span>
							</div>
							{scheduleResult.conflicts.slice(0, 2).map((conflict, i) => (
								<p key={i} className="text-xs text-amber-700">
									{conflict.suggestion}
								</p>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden">
					<div className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 px-6 pt-6 pb-4">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">Schedule My Path</DialogTitle>
							<DialogDescription className="text-sm">
								{showPreview
									? 'Review your generated schedule'
									: `Plan ${pathTitle} in your calendar`}
							</DialogDescription>
						</DialogHeader>
					</div>
					<div className="px-6 pb-6">{modalContent}</div>
					<DialogFooter className="px-6 pb-6 pt-0 gap-3 flex-col sm:flex-row">
						{showPreview ? (
							<>
								<Button
									type="button"
									variant="secondary"
									onClick={() => setShowPreview(false)}
									className="h-11 shrink-0 rounded-xl"
								>
									Adjust Times
								</Button>
								<Button
									type="button"
									onClick={handleAccept}
									className="h-11 shrink-0 rounded-xl font-semibold"
								>
									Accept & Add to Schedule
								</Button>
							</>
						) : (
							<>
								<Button
									type="button"
									variant="secondary"
									onClick={() => onOpenChange(false)}
									className="h-11 shrink-0 rounded-xl"
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={generateSchedule}
									disabled={isGenerating || selectedDays.length === 0}
									className="h-11 shrink-0 rounded-xl font-semibold"
								>
									{isGenerating ? 'Generating...' : 'Generate Schedule'}
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-3xl p-0 max-h-[90vh] overflow-hidden flex flex-col">
				<div className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 px-6 pt-6 pb-4 shrink-0">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">Schedule My Path</DialogTitle>
						<DialogDescription className="text-sm">
							{showPreview
								? 'Review your generated schedule'
								: `Plan ${pathTitle} in your calendar`}
						</DialogDescription>
					</DialogHeader>
				</div>
				<div className="px-6 overflow-y-auto flex-1">{modalContent}</div>
				<DialogFooter className="px-6 pb-6 pt-4 gap-3 shrink-0 border-t bg-muted/30">
					{showPreview ? (
						<>
							<Button
								type="button"
								variant="secondary"
								onClick={() => setShowPreview(false)}
								className="flex-1 h-12 rounded-xl"
							>
								Back
							</Button>
							<Button
								type="button"
								onClick={handleAccept}
								className="flex-1 h-12 rounded-xl font-semibold"
							>
								Accept & Add
							</Button>
						</>
					) : (
						<>
							<Button
								type="button"
								variant="secondary"
								onClick={() => onOpenChange(false)}
								className="flex-1 h-12 rounded-xl"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={generateSchedule}
								disabled={isGenerating || selectedDays.length === 0}
								className="flex-1 h-12 rounded-xl font-semibold"
							>
								{isGenerating ? '...' : 'Generate'}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
