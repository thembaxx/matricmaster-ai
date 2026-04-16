'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';
import type {
	AvailableHours,
	LoadSheddingSlot,
	PathScheduleResult,
	StudyStep,
} from '@/services/studyPathSchedulerService';
import { DaySelector } from './SchedulePathModal/DaySelector';
import { LoadSheddingSlots, LoadSheddingToggle } from './SchedulePathModal/LoadSheddingConfig';
import { SchedulePreview, ScheduleSummary } from './SchedulePathModal/SchedulePreview';
import { TimeRangePicker } from './SchedulePathModal/TimeRangePicker';

interface SchedulePathModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	steps: StudyStep[];
	pathTitle: string;
	onScheduleGenerated?: (result: PathScheduleResult) => void;
}

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const mediaQuery = window.matchMedia(query);
		setMatches(mediaQuery.matches);

		const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	}, [query]);

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
	const { targetAPS } = useSettings();

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
					targetAPS,
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

	const modalContent = (
		<div className="space-y-6">
			{!showPreview ? (
				<>
					<ScheduleSummary stepsLength={steps.length} hours={hours} minutes={minutes} />

					<DaySelector selectedDays={selectedDays} onToggle={toggleDay} />

					<TimeRangePicker
						startHour={startHour}
						endHour={endHour}
						onStartHourChange={setStartHour}
						onEndHourChange={setEndHour}
					/>

					<LoadSheddingToggle enabled={includeLoadShedding} onToggle={setIncludeLoadShedding} />

					{includeLoadShedding && (
						<LoadSheddingSlots
							slots={loadSheddingSlots}
							onAddSlot={addLoadSheddingSlot}
							onUpdateSlot={updateLoadSheddingSlot}
							onRemoveSlot={removeLoadSheddingSlot}
						/>
					)}
				</>
			) : scheduleResult ? (
				<SchedulePreview result={scheduleResult} hours={hours} minutes={minutes} />
			) : null}
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
			<DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
				<div className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 px-4 pt-4 pb-2">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">Schedule My Path</DialogTitle>
						<DialogDescription className="text-sm">
							{showPreview
								? 'Review your generated schedule'
								: `Plan ${pathTitle} in your calendar`}
						</DialogDescription>
					</DialogHeader>
				</div>
				<div className="flex-1 overflow-y-auto px-4 pb-4">{modalContent}</div>
				<Separator />
				<DialogFooter className="px-4 py-3 gap-2 flex-col sm:flex-row">
					{showPreview ? (
						<>
							<Button
								type="button"
								variant="secondary"
								onClick={() => setShowPreview(false)}
								className="h-10 w-full rounded-xl"
							>
								Adjust Times
							</Button>
							<Button
								type="button"
								onClick={handleAccept}
								className="h-10 w-full rounded-xl font-semibold"
							>
								Accept
							</Button>
						</>
					) : (
						<>
							<Button
								type="button"
								variant="secondary"
								onClick={() => onOpenChange(false)}
								className="h-10 w-full rounded-xl"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={generateSchedule}
								disabled={isGenerating || selectedDays.length === 0}
								className="h-10 w-full rounded-xl font-semibold"
							>
								{isGenerating ? 'Generating...' : 'Generate'}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
