'use client';

import { Calendar04Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useReducer, useState } from 'react';
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
import { formReducer, getInitialFormState } from '@/hooks/useAddBlockForm';
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

function useMediaQuery(query: string): boolean {
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
	const isEditing = !!editMode;

	const { data: subjectsData } = useQuery({
		queryKey: ['enrolledSubjects'],
		queryFn: () => getEnrolledSubjectsAction(),
	});

	const subjects = subjectsData ?? [];

	const [formState, formDispatch] = useReducer(formReducer, editMode, getInitialFormState);
	const [isSubmitting, setIsSubmitting] = useReducer((_, payload: boolean) => payload, false);

	const titleId = useId();
	const dateId = useId();
	const startTimeId = useId();
	const endTimeId = useId();
	const repeatableId = useId();

	useEffect(() => {
		formDispatch({ type: 'INIT_FROM_BLOCK', payload: editMode! });
	}, [editMode]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formState.title.trim()) {
			toast.error('Please enter a title');
			return;
		}

		setIsSubmitting(true);
		try {
			const [year, month, day] = formState.date.split('-').map(Number);
			const [startHour, startMin] = formState.startTime.split(':').map(Number);
			const [endHour, endMin] = formState.endTime.split(':').map(Number);

			const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0, 0);
			const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0, 0);

			if (endDateTime <= startDateTime) {
				toast.error('End time must be after start time');
				setIsSubmitting(false);
				return;
			}

			const subjectIdNum = formState.subjectId
				? Number.parseInt(formState.subjectId, 10)
				: undefined;

			if (isEditing && editMode) {
				const result = await updateCalendarEventAction(editMode.id, {
					title: formState.title.trim(),
					startTime: startDateTime,
					endTime: endDateTime,
					eventType: formState.repeatable ? 'recurring' : 'study_session',
					subjectId: subjectIdNum,
				});

				if (result.success) {
					toast.success('Study block updated!');
					formDispatch({ type: 'RESET_FORM' });
					onOpenChange(false);
					onSuccess?.();
				} else {
					toast.error('Failed to update study block');
				}
			} else {
				const result = await createCalendarEventAction({
					title: formState.title.trim(),
					startTime: startDateTime,
					endTime: endDateTime,
					eventType: formState.repeatable ? 'recurring' : 'study_session',
					subjectId: subjectIdNum,
				});

				if (result.success) {
					toast.success('Study block added!');
					formDispatch({ type: 'RESET_FORM' });
					onOpenChange(false);
					onSuccess?.();
				} else {
					toast.error('Failed to add study block');
				}
			}
		} catch (error) {
			console.debug('Error saving event:', error);
			toast.error('Something went wrong');
		} finally {
			setIsSubmitting(false);
		}
	};

	const formContent = (
		<form onSubmit={handleSubmit} className="space-y-5">
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
					value={formState.title}
					onChange={(e) => formDispatch({ type: 'SET_TITLE', payload: e.target.value })}
					className="h-12 rounded-xl"
					required
				/>
			</div>

			<div className="space-y-2.5">
				<Label
					htmlFor={titleId}
					className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
				>
					Subject <span className="text-muted-foreground/50 font-normal">(optional)</span>
				</Label>
				{subjects.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => formDispatch({ type: 'SET_SUBJECT_ID', payload: '' })}
							className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
								formState.subjectId === ''
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
								onClick={() =>
									formDispatch({ type: 'SET_SUBJECT_ID', payload: String(subject.id) })
								}
								className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
									formState.subjectId === String(subject.id)
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

			<div className="space-y-2.5">
				<DatePicker
					label="Date"
					htmlFor={dateId}
					date={formState.date}
					setDate={(d) => formDispatch({ type: 'SET_DATE', payload: d })}
					icon={<HugeiconsIcon icon={Calendar04Icon} className="h-4 w-4" />}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<TimePicker
					htmlFor={startTimeId}
					label="Start Time"
					time={formState.startTime}
					setTime={(t) => formDispatch({ type: 'SET_START_TIME', payload: t })}
					icon={<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />}
				/>
				<TimePicker
					htmlFor={endTimeId}
					label="End Time"
					time={formState.endTime}
					setTime={(t) => formDispatch({ type: 'SET_END_TIME', payload: t })}
					icon={<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />}
				/>
			</div>

			<div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/30">
				<div className="space-y-0.5">
					<Label htmlFor={repeatableId} className="text-sm font-bold">
						Repeat Weekly
					</Label>
					<p className="text-xs text-muted-foreground">Automatically repeat every week</p>
				</div>
				<Switch
					id={repeatableId}
					checked={formState.repeatable}
					onCheckedChange={(v) => formDispatch({ type: 'SET_REPEATABLE', payload: v })}
				/>
			</div>

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
