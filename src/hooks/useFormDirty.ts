'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFormDirtyOptions {
	enabled?: boolean;
	message?: string;
}

export function useFormDirty({
	enabled = true,
	message = 'You have unsaved changes. Are you sure you want to leave?',
}: UseFormDirtyOptions = {}) {
	const isDirtyRef = useRef(false);
	// const pathname = usePathname(); // Available for future route change detection

	const setDirty = useCallback((dirty: boolean) => {
		isDirtyRef.current = dirty;
	}, []);

	const checkDirty = useCallback(() => {
		return isDirtyRef.current;
	}, []);

	useEffect(() => {
		if (!enabled) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (isDirtyRef.current) {
				event.preventDefault();
				return message;
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [enabled, message]);

	return {
		isDirty: isDirtyRef.current,
		setDirty,
		checkDirty,
	};
}

export function useMultiStepForm<T extends Record<string, unknown>>(
	initialData: T,
	onComplete?: (data: T) => void | Promise<void>
) {
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<T>(initialData);
	const [isDirty, setIsDirty] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { setDirty } = useFormDirty({ enabled: isDirty });

	const updateField = useCallback(
		<K extends keyof T>(field: K, value: T[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setIsDirty(true);
			setDirty(true);
		},
		[setDirty]
	);

	const nextStep = useCallback(() => {
		setCurrentStep((prev) => prev + 1);
	}, []);

	const prevStep = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	const goToStep = useCallback((step: number) => {
		setCurrentStep(step);
	}, []);

	const submit = useCallback(async () => {
		setIsSubmitting(true);
		try {
			if (onComplete) {
				await onComplete(formData);
			}
			setIsDirty(false);
			setDirty(false);
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, onComplete, setDirty]);

	const canNavigate = useCallback((_targetStep: number) => {
		return true;
	}, []);

	const handleStepNavigation = useCallback(
		(targetStep: number) => {
			if (!canNavigate(targetStep)) {
				if (!window.confirm('Moving forward may lose your current step data. Continue?')) {
					return false;
				}
			}
			goToStep(targetStep);
			return true;
		},
		[canNavigate, goToStep]
	);

	return {
		currentStep,
		formData,
		isDirty,
		isSubmitting,
		updateField,
		nextStep,
		prevStep,
		goToStep: handleStepNavigation,
		submit,
		setFormData,
	};
}
