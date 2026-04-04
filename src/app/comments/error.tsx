'use client';

import { RouteError } from '@/components/RouteError';

export default function CommentsError({
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
			title="comments error"
			message="unable to load comments. please try again."
		/>
	);
}
