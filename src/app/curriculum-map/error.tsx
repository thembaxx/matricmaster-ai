'use client';

import { RouteError } from '@/components/RouteError';

export default function CurriculumMapError({
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
			title="curriculum map error"
			message="unable to load the curriculum map. please try again."
		/>
	);
}
