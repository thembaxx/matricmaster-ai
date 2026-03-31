'use client';

import { RouteError } from '@/components/RouteError';

export default function OnboardingError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<RouteError
			error={error}
			reset={reset}
			title="onboarding error"
			description="unable to complete setup. please try again."
			showHomeButton={false}
		/>
	);
}
