'use client';

import { RouteError } from '@/components/RouteError';

export default function NotificationsError({
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
			title="notifications error"
			description="unable to load notifications. please try again."
		/>
	);
}
