'use client';

import { RouteError } from '@/components/RouteError';

export default function AiTutorError({
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
			title="ai tutor error"
			message="unable to connect with the ai tutor. please try again."
		/>
	);
}
