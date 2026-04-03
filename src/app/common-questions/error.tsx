'use client';

import { RouteError } from '@/components/RouteError';

export default function CommonQuestionsError({
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
			title="common questions error"
			message="unable to load common questions. please try again."
		/>
	);
}
