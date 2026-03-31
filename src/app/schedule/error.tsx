'use client';

import { RouteError } from '@/components/RouteError';

export default function ScheduleError({
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
			title="schedule error"
			description="unable to load schedule. please try again."
		/>
	);
}
