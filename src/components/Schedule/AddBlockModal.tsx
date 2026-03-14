'use client';

import { Calendar04Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	createCalendarEventAction,
	getEnrolledSubjectsAction,
	updateCalendarEventAction,
} from '@/lib/db/actions';
import { DatePicker } from '../ui/date-picker';
import { TimePicker } from '../ui/time-picker';

interface BlockData {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	eventType: string;
	subjectId?: number;
}

interface AddBlockModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
	editMode?: BlockData | null;
}

function getCurrentDateString(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function formatTimeFromDate(date: Date): string {
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
}

function formatDateFromDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(true);

	useEffect(() => {
		const check = () => setMatches(window.matchMedia(query).matches);
		check();
		const mediaQuery = window.matchMedia(query);
		mediaQuery.addEventListener('change', check);
		return () => mediaQuery.removeEventListener('change', check);
	}, [query]);

	return matches;
}

export function AddBlockModal({ open, onOpenChange, onSuccess, editMode }: AddBlockModalProps) {
	const isDesktop = useMediaQuery('(min-width: 1024px)');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState('');
	const [date, setDate] = useState(getCurrentDateString());
	const [startTime, setStartTime] = useState('14:00');
	const [endTime, setEndTime] = useState('15:30');
	const [repeatable, setRepeatable] = useState(false);
	const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
	const [subjectId, setSubjectId] = useState<string>('');

	const titleId = useId();
	const dateId = useId();
	const startTimeId = useId();
	const endTimeId = useId();
	const repeatableId = useId();

	const isEditing = !!editMode;

	useEffect(() => {
		async function loadSubjects() {
			const data = await getEnrolledSubjectsAction();
			setSubjects(data);
		}
		loadSubjects();
	}, []);

	useEffect(() => {
		if (open) {
			if (editMode) {
				setTitle(editMode.title);
				const start = new Date(editMode.startTime);
				const end = new Date(editMode.endTime);
				setDate(formatDateFromDate(start));
				setStartTime(formatTimeFromDate(start));
				setEndTime(formatTimeFromDate(end));
				setRepeatable(editMode.eventType === 'recurring');
				setSubjectId(editMode.subjectId ? String(editMode.subjectId) : '');
			} else {
				setTitle('');
				setDate(getCurrentDateString());
				setStartTime('14:00');
				setEndTime('15:30');
				setRepeatable(false);
				setSubjectId('');
			}
		}
	}, [open, editMode]);

	const resetForm = () => {
		setTitle('');
		setDate(getCurrentDateString());
		setStartTime('14:00');
		setEndTime('15:30');
		setRepeatable(false);
		setSubjectId('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error('Please enter a title');
			return;
		}

		setIsSubmitting(true);
		try {
			const [year, month, day] = date.split('-').map(Number);
			const [startHour, startMin] = startTime.split(':').map(Number);
			const [endHour, endMin] = endTime.split(':').map(Number);

			const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0, 0);
			const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0, 0);

			if (endDateTime <= startDateTime) {
				toast.error('End time must be after start time');
				setIsSubmitting(false);
				return;
			}

			const subjectIdNum = subjectId ? Number.parseInt(subjectId, 10) : undefined;

			if (isEditing && editMode) {
				const result = await updateCalendarEventAction(editMode.id, {
					title: title.trim(),
					startTime: startDateTime,
					endTime: endDateTime,
					eventType: repeatable ? 'recurring' : 'study_session',
					subjectId: subjectIdNum,
				});

				if (result.success) {
					toast.success('Study block updated!');
					resetForm();
					onOpenChange(false);
					onSuccess?.();
				} else {
					toast.error('Failed to update study block');
				}
			} else {
				const result = await createCalendarEventAction({
					title: title.trim(),
					startTime: startDateTime,
					endTime: endDateTime,
					eventType: repeatable ? 'recurring' : 'study_session',
					subjectId: subjectIdNum,
				});

				if (result.success) {
					toast.success('Study block added!');
					resetForm();
					onOpenChange(false);
					onSuccess?.();
				} else {
					toast.error('Failed to add study block');
				}
			}
		} catch (error) {
			console.error('Error saving event:', error);
			toast.error('Something went wrong');
		} finally {
			setIsSubmitting(false);
		}
	};

	const formContent = (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* Title */}
			<div className="space-y-2.5">
				<Label
					htmlFor={titleId}
					className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
				>
					Title
				</Label>
				<Input
					id={titleId}
					placeholder="e.g., Mathematics Study"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="h-12 rounded-xl"
					required
				/>
			</div>

			{/* Subject */}
			<div className="space-y-2.5">
				<Label
					htmlFor={subjectId}
					className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
				>
					Subject <span className="text-muted-foreground/50 font-normal">(optional)</span>
				</Label>
				{subjects.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => setSubjectId('')}
							className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
								subjectId === ''
									? 'bg-muted text-muted-foreground'
									: 'bg-muted/50 text-muted-foreground/70 hover:bg-muted'
							}`}
						>
							None
						</button>
						{subjects.map((subject) => (
							<button
								key={subject.id}
								type="button"
								onClick={() => setSubjectId(String(subject.id))}
								className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
									subjectId === String(subject.id)
										? 'bg-primary text-primary-foreground shadow-md'
										: 'bg-muted/50 text-muted-foreground/70 hover:bg-muted'
								}`}
							>
								{subject.name}
							</button>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground/60 italic">No subjects enrolled</p>
				)}
			</div>

			{/* Date */}
			<div className="space-y-2.5">
				<DatePicker
					label="Date"
					htmlFor={dateId}
					date={date}
					setDate={setDate}
					icon={<HugeiconsIcon icon={Calendar04Icon} className="h-4 w-4" />}
				/>
			</div>

			{/* Time */}
			<div className="grid grid-cols-2 gap-4">
				<TimePicker
					htmlFor={startTimeId}
					label="Start Time"
					time={startTime}
					setTime={setStartTime}
					icon={<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />}
				/>
				<TimePicker
					htmlFor={endTimeId}
					label="End Time"
					time={endTime}
					setTime={setEndTime}
					icon={<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />}
				/>
			</div>

			{/* Repeat Toggle */}
			<div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/30">
				<div className="space-y-0.5">
					<Label htmlFor={repeatableId} className="text-sm font-bold">
						Repeat Weekly
					</Label>
					<p className="text-xs text-muted-foreground">Automatically repeat every week</p>
				</div>
				<Switch id={repeatableId} checked={repeatable} onCheckedChange={setRepeatable} />
			</div>

			{/* Actions */}
			<DialogFooter className="gap-3 py-2 flex flex-col">
				<Button
					type="button"
					size="sm"
					variant="secondary"
					onClick={() => onOpenChange(false)}
					className="h-11 shrink-0 rounded-xl border-border/50"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					size="sm"
					disabled={isSubmitting}
					className="h-11 shrink-0 rounded-xl font-semibold"
				>
					{isSubmitting
						? isEditing
							? 'Updating...'
							: 'Adding...'
						: isEditing
							? 'Update Block'
							: 'Add Block'}
				</Button>
			</DialogFooter>
		</form>
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
					<div className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 px-6 pt-6 pb-4">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								{isEditing ? 'Edit Study Block' : 'Add Study Block'}
							</DialogTitle>
							<DialogDescription className="text-sm">
								{isEditing
									? 'Update your study block details'
									: 'Create a new study block for your schedule'}
							</DialogDescription>
						</DialogHeader>
					</div>
					<div className="px-6 pb-6">{formContent}</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="rounded-t-[2.5rem] px-4 pb-8">
				<div className="bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 -mx-4 px-6 pt-3 pb-4 mb-2">
					<DrawerHeader className="text-left p-0">
						<DrawerTitle className="text-xl font-bold">
							{isEditing ? 'Edit Study Block' : 'Add Study Block'}
						</DrawerTitle>
						<DrawerDescription className="text-sm">
							{isEditing
								? 'Update your study block details'
								: 'Create a new study block for your schedule'}
						</DrawerDescription>
					</DrawerHeader>
				</div>
				<div className="px-1 overflow-y-auto max-h-[70vh]">{formContent}</div>
			</DrawerContent>
		</Drawer>
	);
}
