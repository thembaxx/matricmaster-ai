'use client';

import { RouteError } from '@/components/RouteError';

export default function LessonsError({
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
			title="lessons error"
			description="unable to load lessons. please try again."
		/>
	);
}
