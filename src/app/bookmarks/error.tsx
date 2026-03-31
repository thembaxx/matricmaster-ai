'use client';

import { RouteError } from '@/components/RouteError';

export default function BookmarksError({
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
			title="bookmarks error"
			description="unable to load bookmarks. please try again."
		/>
	);
}
