'use client';

import { RouteError } from '@/components/RouteError';

export default function CalendarError({
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
			title="calendar error"
			description="unable to load calendar. please try again."
		/>
	);
}
