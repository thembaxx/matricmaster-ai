'use client';

import { RouteError } from '@/components/RouteError';

export default function OfflineError({
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
			title="offline error"
			message="unable to load offline content. please check your connection and try again."
		/>
	);
}
