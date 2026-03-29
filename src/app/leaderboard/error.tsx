'use client';

import { RouteError } from '@/components/RouteError';

export default function LeaderboardError({
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
			title="leaderboard error"
			description="unable to load leaderboard. please try again."
		/>
	);
}
