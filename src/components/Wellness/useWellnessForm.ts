'use client';

import { useCallback, useId, useState } from 'react';
import type { WellnessCheckInData } from './WellnessCheckIn';

interface WellnessFormState {
	mood: number | null;
	isFrustrated: boolean | null;
	needsBreak: 'yes' | 'no' | 'suggestions' | null;
	showCrisisResources: boolean;
}

interface UseWellnessFormReturn extends WellnessFormState {
	moodGroupId: string;
	frustrationGroupId: string;
	breakGroupId: string;
	isBurnedOut: boolean;
	setMood: (value: number | null) => void;
	setIsFrustrated: (value: boolean | null) => void;
	setNeedsBreak: (value: 'yes' | 'no' | 'suggestions' | null) => void;
	setShowCrisisResources: (value: boolean) => void;
	resetForm: () => void;
	getFormData: () => WellnessCheckInData;
}

export function useWellnessForm(): UseWellnessFormReturn {
	const moodGroupId = useId();
	const frustrationGroupId = useId();
	const breakGroupId = useId();

	const [mood, setMood] = useState<number | null>(null);
	const [isFrustrated, setIsFrustrated] = useState<boolean | null>(null);
	const [needsBreak, setNeedsBreak] = useState<'yes' | 'no' | 'suggestions' | null>(null);
	const [showCrisisResources, setShowCrisisResources] = useState(false);

	const isBurnedOut = needsBreak === 'yes' || isFrustrated === true;

	const resetForm = useCallback(() => {
		setMood(null);
		setIsFrustrated(null);
		setNeedsBreak(null);
		setShowCrisisResources(false);
	}, []);

	const getFormData = useCallback((): WellnessCheckInData => {
		return {
			mood: mood ?? 3,
			isFrustrated: isFrustrated ?? false,
			needsBreak: needsBreak ?? 'no',
		};
	}, [mood, isFrustrated, needsBreak]);

	return {
		mood,
		isFrustrated,
		needsBreak,
		showCrisisResources,
		moodGroupId,
		frustrationGroupId,
		breakGroupId,
		isBurnedOut,
		setMood,
		setIsFrustrated,
		setNeedsBreak,
		setShowCrisisResources,
		resetForm,
		getFormData,
	};
}

export type { WellnessFormState };
