'use client';

import { RouteError } from '@/components/RouteError';

export default function SetworkLibraryError({
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
			title="setwork library error"
			message="unable to load the setwork library. please try again."
		/>
	);
}
