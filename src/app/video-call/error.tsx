'use client';

import { RouteError } from '@/components/RouteError';

export default function VideoCallError({
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
			title="video call error"
			message="unable to start the video call. please try again."
		/>
	);
}
