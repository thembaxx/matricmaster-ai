'use client';

import { RouteError } from '@/components/RouteError';

export default function PastPapersError({
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
			title="past papers error"
			message="unable to load past papers. please try again."
		/>
	);
}
