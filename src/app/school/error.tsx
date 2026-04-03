'use client';

import { RouteError } from '@/components/RouteError';

export default function SchoolError({
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
			title="school error"
			message="unable to load the school page. please try again."
		/>
	);
}
