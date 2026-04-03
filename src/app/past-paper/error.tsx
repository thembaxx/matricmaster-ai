'use client';

import { RouteError } from '@/components/RouteError';

export default function PastPaperError({
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
			title="past paper error"
			message="unable to load past paper. please try again."
			homeLink="/past-papers"
			homeLabel="past papers"
		/>
	);
}
