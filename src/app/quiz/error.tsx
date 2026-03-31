'use client';

import { RouteError } from '@/components/RouteError';

export default function QuizError({
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
			title="quiz error"
			description="unable to load the quiz. your progress may not have been saved."
		/>
	);
}
