'use client';

import { Calendar04Icon, Clock01Icon, TextIcon } from '@hugeicons/core-free-icons';
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
import { Textarea } from '@/components/ui/textarea';
import { createCalendarEventAction } from '@/lib/db/actions';

interface AddBlockModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

function getCurrentDateString(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
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

export function AddBlockModal({ open, onOpenChange, onSuccess }: AddBlockModalProps) {
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState('');
	const [date, setDate] = useState(getCurrentDateString());
	const [startTime, setStartTime] = useState('14:00');
	const [endTime, setEndTime] = useState('15:30');
	const [notes, setNotes] = useState('');
	const [repeatable, setRepeatable] = useState(false);

	const titleId = useId();
	const dateId = useId();
	const startTimeId = useId();
	const endTimeId = useId();
	const notesId = useId();
	const repeatableId = useId();

	const resetForm = () => {
		setTitle('');
		setDate(getCurrentDateString());
		setStartTime('14:00');
		setEndTime('15:30');
		setNotes('');
		setRepeatable(false);
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

			const result = await createCalendarEventAction({
				title: title.trim(),
				startTime: startDateTime,
				endTime: endDateTime,
				eventType: repeatable ? 'recurring' : 'study_session',
			});

			if (result.success) {
				toast.success('Study block added!');
				resetForm();
				onOpenChange(false);
				onSuccess?.();
			} else {
				toast.error('Failed to add study block');
			}
		} catch (error) {
			console.error('Error creating event:', error);
			toast.error('Something went wrong');
		} finally {
			setIsSubmitting(false);
		}
	};

	const formContent = (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-3">
				<Label
					htmlFor={titleId}
					className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
				>
					Title
				</Label>
				<Input
					id={titleId}
					placeholder="e.g., Mathematics Study"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="h-12"
					required
				/>
			</div>

			<div className="space-y-3">
				<Label
					htmlFor={dateId}
					className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
				>
					<HugeiconsIcon icon={Calendar04Icon} className="w-3 h-3 inline mr-1" />
					Date
				</Label>
				<Input
					id={dateId}
					type="date"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					className="h-12"
					required
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-3">
					<Label
						htmlFor={startTimeId}
						className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
					>
						<HugeiconsIcon icon={Clock01Icon} className="w-3 h-3 inline mr-1" />
						Start Time
					</Label>
					<Input
						id={startTimeId}
						type="time"
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						className="h-12"
						required
					/>
				</div>
				<div className="space-y-3">
					<Label
						htmlFor={endTimeId}
						className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
					>
						<HugeiconsIcon icon={Clock01Icon} className="w-3 h-3 inline mr-1" />
						End Time
					</Label>
					<Input
						id={endTimeId}
						type="time"
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						className="h-12"
						required
					/>
				</div>
			</div>

			<div className="space-y-3">
				<Label
					htmlFor={notesId}
					className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
				>
					<HugeiconsIcon icon={TextIcon} className="w-3 h-3 inline mr-1" />
					Notes <span className="text-muted-foreground/50 font-normal">(optional)</span>
				</Label>
				<Textarea
					id={notesId}
					placeholder="Add any notes for this study block..."
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					className="min-h-[80px] resize-none"
					rows={3}
				/>
			</div>

			<div className="flex items-center justify-between py-2">
				<div className="space-y-1">
					<Label htmlFor={repeatableId} className="text-xs font-semibold uppercase tracking-wider">
						Repeat Weekly
					</Label>
					<p className="text-[10px] text-muted-foreground">
						Automatically repeat this block every week
					</p>
				</div>
				<Switch id={repeatableId} checked={repeatable} onCheckedChange={setRepeatable} />
			</div>

			<DialogFooter className="gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => onOpenChange(false)}
					className="flex-1 h-12"
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting} className="flex-1 h-12 font-semibold">
					{isSubmitting ? 'Adding...' : 'Add Block'}
				</Button>
			</DialogFooter>
		</form>
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md rounded-3xl">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">Add Study Block</DialogTitle>
						<DialogDescription className="text-sm">
							Create a new study block for your schedule
						</DialogDescription>
					</DialogHeader>
					{formContent}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="rounded-t-[2rem] px-4 pb-6">
				<DrawerHeader className="text-left pb-2">
					<DrawerTitle className="text-xl font-bold">Add Study Block</DrawerTitle>
					<DrawerDescription className="text-sm">
						Create a new study block for your schedule
					</DrawerDescription>
				</DrawerHeader>
				<div className="px-1 overflow-y-auto max-h-[70vh]">{formContent}</div>
			</DrawerContent>
		</Drawer>
	);
}
