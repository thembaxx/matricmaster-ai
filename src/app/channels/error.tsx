'use client';

import { RouteError } from '@/components/RouteError';

export default function ChannelsError({
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
			title="channels error"
			description="unable to load channels. please try again."
		/>
	);
}
