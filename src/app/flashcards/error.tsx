'use client';

import { RouteError } from '@/components/RouteError';

export default function FlashcardsError({
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
			title="flashcards error"
			message="unable to load flashcards. please try again."
		/>
	);
}
