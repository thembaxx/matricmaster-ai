'use client';

import { RouteError } from '@/components/RouteError';

export default function AchievementsError({
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
			title="achievements error"
			message="unable to load achievements. please try again."
		/>
	);
}
