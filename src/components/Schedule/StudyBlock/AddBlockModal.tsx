'use client';

import { useQuery } from '@tanstack/react-query';
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { getEnrolledSubjectsAction } from '@/lib/db/actions';
import { RecurrenceToggle } from './RecurrenceToggle';
import { StudyBlockDateTimePicker } from './StudyBlockDateTimePicker';
import { StudyBlockFormActions } from './StudyBlockFormActions';
import { StudyBlockTitleInput } from './StudyBlockTitleInput';
import { SubjectSelector } from './SubjectSelector';
import { useMediaQuery } from './useMediaQuery';
import type { BlockData } from './useStudyBlockForm';
import { useStudyBlockForm } from './useStudyBlockForm';

interface AddBlockModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
	editMode?: BlockData | null;
}

export function AddBlockModal({ open, onOpenChange, onSuccess, editMode }: AddBlockModalProps) {
	const isDesktop = useMediaQuery('(min-width: 1024px)');
	const isEditing = !!editMode;

	const { data: subjectsData } = useQuery({
		queryKey: ['enrolledSubjects'],
		queryFn: () => getEnrolledSubjectsAction(),
	});

	const subjects = subjectsData ?? [];

	const {
		formState,
		isSubmitting,
		titleId,
		dateId,
		startTimeId,
		endTimeId,
		repeatableId,
		handleTitleChange,
		handleDateChange,
		handleStartTimeChange,
		handleEndTimeChange,
		handleRepeatableChange,
		handleSubjectIdChange,
		handleSubmit,
	} = useStudyBlockForm({
		editMode,
		onSuccess,
		onClose: () => onOpenChange(false),
	});

	const formContent = (
		<form onSubmit={handleSubmit} className="space-y-5">
			<StudyBlockTitleInput id={titleId} value={formState.title} onChange={handleTitleChange} />

			<SubjectSelector
				id={repeatableId}
				subjects={subjects}
				selectedSubjectId={formState.subjectId}
				onChange={handleSubjectIdChange}
			/>

			<StudyBlockDateTimePicker
				dateId={dateId}
				startTimeId={startTimeId}
				endTimeId={endTimeId}
				date={formState.date}
				startTime={formState.startTime}
				endTime={formState.endTime}
				onDateChange={handleDateChange}
				onStartTimeChange={handleStartTimeChange}
				onEndTimeChange={handleEndTimeChange}
			/>

			<RecurrenceToggle
				id={repeatableId}
				checked={formState.repeatable}
				onChange={handleRepeatableChange}
			/>

			<StudyBlockFormActions
				onCancel={() => onOpenChange(false)}
				isSubmitting={isSubmitting}
				isEditing={isEditing}
			/>
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
