'use client';

import { CalendarsIcon, ClockIcon, Delete02Icon, SaveIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { StudyBlock } from '@/types/smart-scheduler';

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'History',
	'English',
	'Accounting',
	'Economics',
	'Chemistry',
];

const BLOCK_TYPES = [
	{ value: 'study', label: 'Study' },
	{ value: 'review', label: 'Review' },
	{ value: 'practice', label: 'Practice' },
	{ value: 'break', label: 'Break' },
];

const DURATIONS = [
	{ value: '15', label: '15 min' },
	{ value: '30', label: '30 min' },
	{ value: '45', label: '45 min' },
	{ value: '60', label: '1 hour' },
	{ value: '90', label: '1.5 hours' },
	{ value: '120', label: '2 hours' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const MINUTES = ['00', '15', '30', '45'];

interface BlockEditorProps {
	block?: StudyBlock;
	defaultDate?: Date;
	onSave: (block: Partial<StudyBlock>) => void;
	onDelete?: (blockId: string) => void;
	onClose: () => void;
	isSaving?: boolean;
}

export function BlockEditor({
	block,
	defaultDate,
	onSave,
	onDelete,
	onClose,
	isSaving = false,
}: BlockEditorProps) {
	const [subject, setSubject] = useState(block?.subject || 'Mathematics');
	const [topic, setTopic] = useState(block?.topic || '');
	const [date, setDate] = useState<Date>(block?.date || defaultDate || new Date());
	const [startHour, setStartHour] = useState(
		block?.startTime ? Number.parseInt(block.startTime.split(':')[0], 10) : 9
	);
	const [startMin, setStartMin] = useState(block?.startTime ? block.startTime.split(':')[1] : '00');
	const [duration, setDuration] = useState(block?.duration || 45);
	const [type, setType] = useState(block?.type || 'study');

	const endMin = startHour * 60 + Number.parseInt(startMin, 10) + duration;
	const endHourCalc = Math.floor(endMin / 60);
	const endMinCalc = String(endMin % 60).padStart(2, '0');

	const handleSave = () => {
		const saveEndMin = startHour * 60 + Number.parseInt(startMin, 10) + duration;
		const saveEndHour = Math.floor(saveEndMin / 60);
		const saveEndMinStr = String(saveEndMin % 60).padStart(2, '0');

		onSave({
			id: block?.id,
			subject,
			topic: topic || undefined,
			date,
			startTime: `${startHour.toString().padStart(2, '0')}:${startMin}`,
			endTime: `${saveEndHour.toString().padStart(2, '0')}:${saveEndMinStr}`,
			duration,
			type: type as StudyBlock['type'],
			isCompleted: block?.isCompleted || false,
			isAISuggested: false,
		});
		onClose();
	};

	return (
		<div className="p-4 w-full max-w-80">
			<h3 className="font-semibold mb-4">{block ? 'Edit Block' : 'Add Study Block'}</h3>

			<div className="space-y-4">
				<div>
					<Label>Subject</Label>
					<Select value={subject} onValueChange={setSubject}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SUBJECTS.map((s) => (
								<SelectItem key={s} value={s}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label>Topic (optional)</Label>
					<Input
						placeholder="e.g., Calculus"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
					/>
				</div>

				<div>
					<Label>Date</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									'w-full justify-start text-left font-normal',
									!date && 'text-muted-foreground'
								)}
							>
								<HugeiconsIcon icon={CalendarsIcon} className="mr-2 h-4 w-4" />
								{date ? date.toLocaleDateString() : 'Pick a date'}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={date}
								onSelect={(d) => d && setDate(d)}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<Label>Start Time</Label>
						<div className="flex gap-1">
							<Select
								value={startHour.toString()}
								onValueChange={(v) => setStartHour(Number.parseInt(v, 10))}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{HOURS.map((h) => (
										<SelectItem key={h} value={h.toString()}>
											{h.toString().padStart(2, '0')}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={startMin} onValueChange={setStartMin}>
								<SelectTrigger className="w-16">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{MINUTES.map((m) => (
										<SelectItem key={m} value={m}>
											{m}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div>
						<Label>Duration</Label>
						<Select
							value={duration.toString()}
							onValueChange={(v) => setDuration(Number.parseInt(v, 10))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{DURATIONS.map((d) => (
									<SelectItem key={d.value} value={d.value}>
										{d.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div>
					<Label>Type</Label>
					<Select
						value={type}
						onValueChange={(v) => setType(v as 'study' | 'review' | 'practice' | 'break')}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{BLOCK_TYPES.map((t) => (
								<SelectItem key={t.value} value={t.value}>
									{t.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<HugeiconsIcon icon={ClockIcon} className="h-4 w-4" />
					<span>
						{`${startHour.toString().padStart(2, '0')}:${startMin} - ${endHourCalc
							.toString()
							.padStart(2, '0')}:${endMinCalc}`}
					</span>
				</div>

				<div className="flex gap-2 pt-2">
					{block && onDelete && (
						<Button
							type="button"
							variant="destructive"
							size="sm"
							className="flex-1"
							disabled={isSaving}
							onClick={() => onDelete(block.id)}
						>
							<HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-1" />
							Delete
						</Button>
					)}
					<Button
						type="button"
						size="sm"
						className="flex-1"
						disabled={isSaving}
						onClick={handleSave}
					>
						{isSaving ? (
							<div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-1" />
						) : (
							<HugeiconsIcon icon={SaveIcon} className="h-4 w-4 mr-1" />
						)}
						Save
					</Button>
				</div>
			</div>
		</div>
	);
}
