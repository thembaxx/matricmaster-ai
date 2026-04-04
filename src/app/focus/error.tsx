'use client';

import { RouteError } from '@/components/RouteError';

export default function FocusError({
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
			title="focus error"
			message="unable to load focus mode. please try again."
		/>
	);
}
