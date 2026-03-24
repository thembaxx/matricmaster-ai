'use client';

import { useCallback, useEffect, useId, useReducer } from 'react';
import { toast } from 'sonner';
import { type FormState, formReducer, getInitialFormState } from '@/hooks/useAddBlockForm';
import { createCalendarEventAction, updateCalendarEventAction } from '@/lib/db/actions';

interface BlockData {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	eventType: string;
	subjectId?: number;
}

interface UseStudyBlockFormProps {
	editMode?: BlockData | null;
	onSuccess?: () => void;
	onClose: () => void;
}

interface UseStudyBlockFormReturn {
	formState: FormState;
	isSubmitting: boolean;
	titleId: string;
	dateId: string;
	startTimeId: string;
	endTimeId: string;
	repeatableId: string;
	subjectId: string;
	handleTitleChange: (value: string) => void;
	handleDateChange: (value: string) => void;
	handleStartTimeChange: (value: string) => void;
	handleEndTimeChange: (value: string) => void;
	handleRepeatableChange: (value: boolean) => void;
	handleSubjectIdChange: (value: string) => void;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
	resetForm: () => void;
}

export function useStudyBlockForm({
	editMode,
	onSuccess,
	onClose,
}: UseStudyBlockFormProps): UseStudyBlockFormReturn {
	const isEditing = !!editMode;

	const titleId = useId();
	const dateId = useId();
	const startTimeId = useId();
	const endTimeId = useId();
	const repeatableId = useId();

	const [formState, formDispatch] = useReducer(formReducer, editMode, getInitialFormState);
	const [isSubmitting, setIsSubmitting] = useReducer((_, payload: boolean) => payload, false);

	useEffect(() => {
		if (editMode) {
			formDispatch({ type: 'INIT_FROM_BLOCK', payload: editMode });
		}
	}, [editMode]);

	const handleTitleChange = useCallback((value: string) => {
		formDispatch({ type: 'SET_TITLE', payload: value });
	}, []);

	const handleDateChange = useCallback((value: string) => {
		formDispatch({ type: 'SET_DATE', payload: value });
	}, []);

	const handleStartTimeChange = useCallback((value: string) => {
		formDispatch({ type: 'SET_START_TIME', payload: value });
	}, []);

	const handleEndTimeChange = useCallback((value: string) => {
		formDispatch({ type: 'SET_END_TIME', payload: value });
	}, []);

	const handleRepeatableChange = useCallback((value: boolean) => {
		formDispatch({ type: 'SET_REPEATABLE', payload: value });
	}, []);

	const handleSubjectIdChange = useCallback((value: string) => {
		formDispatch({ type: 'SET_SUBJECT_ID', payload: value });
	}, []);

	const resetForm = useCallback(() => {
		formDispatch({ type: 'RESET_FORM' });
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
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
						resetForm();
						onClose();
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
						resetForm();
						onClose();
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
		},
		[formState, isEditing, editMode, onClose, onSuccess, resetForm]
	);

	return {
		formState,
		isSubmitting,
		titleId,
		dateId,
		startTimeId,
		endTimeId,
		repeatableId,
		subjectId: formState.subjectId,
		handleTitleChange,
		handleDateChange,
		handleStartTimeChange,
		handleEndTimeChange,
		handleRepeatableChange,
		handleSubjectIdChange,
		handleSubmit,
		resetForm,
	};
}

export type { BlockData };
