'use client';

import { RouteError } from '@/components/RouteError';

export default function AdminError({
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
			title="admin error"
			message="unable to load the admin panel. please try again."
		/>
	);
}
