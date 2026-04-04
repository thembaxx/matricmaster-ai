'use client';

import { RouteError } from '@/components/RouteError';

export default function DashboardError({
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
			title="dashboard error"
			message="unable to load your dashboard. please try again."
		/>
	);
}
