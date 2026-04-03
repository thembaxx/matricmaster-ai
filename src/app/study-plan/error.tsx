'use client';

import { RouteError } from '@/components/RouteError';

export default function StudyPlanError({
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
			title="study plan error"
			message="unable to load your study plan. please try again."
		/>
	);
}
