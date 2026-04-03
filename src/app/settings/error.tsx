'use client';

import { RouteError } from '@/components/RouteError';

export default function SettingsError({
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
			title="settings error"
			message="unable to load settings. please try again."
		/>
	);
}
