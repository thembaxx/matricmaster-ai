'use client';

import { useCallback, useState } from 'react';

interface SubmissionState {
	isSubmitting: boolean;
	error: string | null;
	localSaveSuccessful: boolean;
}

export function useQuizSubmission() {
	const [state, setState] = useState<SubmissionState>({
		isSubmitting: false,
		error: null,
		localSaveSuccessful: false,
	});

	const submitWithLocalFallback = useCallback(
		async (submitFn: () => Promise<void>, localSaveFn: () => void) => {
			setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

			try {
				await submitFn();
				setState({ isSubmitting: false, error: null, localSaveSuccessful: true });
			} catch (error) {
				console.warn('Cloud submission failed, trying local fallback:', error);
				try {
					localSaveFn();
					setState({
						isSubmitting: false,
						error: 'Cloud sync failed. Your progress will be saved locally.',
						localSaveSuccessful: true,
					});
				} catch (localError) {
					console.error('Local save also failed:', localError);
					setState({
						isSubmitting: false,
						error: 'Failed to save progress. Please try again.',
						localSaveSuccessful: false,
					});
				}
			}
		},
		[]
	);

	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	return {
		...state,
		submitWithLocalFallback,
		clearError,
	};
}
