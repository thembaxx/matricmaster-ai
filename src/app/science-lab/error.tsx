'use client';

import { RouteError } from '@/components/RouteError';

export default function ScienceLabError({
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
			title="science lab error"
			message="unable to load the science lab. please try again."
		/>
	);
}
