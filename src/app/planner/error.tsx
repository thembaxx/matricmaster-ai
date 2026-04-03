'use client';

import { RouteError } from '@/components/RouteError';

export default function PlannerError({
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
			title="planner error"
			message="unable to load the planner. please try again."
		/>
	);
}
