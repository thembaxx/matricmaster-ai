'use client';

import { RouteError } from '@/components/RouteError';

export default function StudyPathError({
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
			title="study path error"
			message="unable to load your study path. please try again."
		/>
	);
}
