'use client';

import { RouteError } from '@/components/RouteError';

export default function SearchError({
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
			title="search error"
			message="unable to perform search. please try again."
		/>
	);
}
