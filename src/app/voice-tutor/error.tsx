'use client';

import { RouteError } from '@/components/RouteError';

export default function VoiceTutorError({
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
			title="voice tutor error"
			message="unable to load the voice tutor. please try again."
		/>
	);
}
