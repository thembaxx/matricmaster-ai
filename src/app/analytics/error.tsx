'use client';

import { RouteError } from '@/components/RouteError';

export default function AnalyticsError({
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
			title="analytics error"
			message="unable to load analytics. please try again."
		/>
	);
}
