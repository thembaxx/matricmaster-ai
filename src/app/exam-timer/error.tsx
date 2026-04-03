'use client';

import { RouteError } from '@/components/RouteError';

export default function ExamTimerError({
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
			title="exam timer error"
			message="unable to load the exam timer. please try again."
		/>
	);
}
