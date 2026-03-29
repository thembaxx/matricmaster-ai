'use client';

import { RouteError } from '@/components/RouteError';

export default function StudyBuddiesError({
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
			title="study buddies error"
			description="unable to load study buddies. please try again."
		/>
	);
}
