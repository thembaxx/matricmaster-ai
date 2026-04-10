import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

interface ServerTimeResponse {
	serverTime: number;
	serverTimeISO: string;
	timezone: string;
}

export function useServerTimeSync(enabled = true) {
	const [offset, setOffset] = useState(0);
	const [isSynced, setIsSynced] = useState(false);
	const syncAttempts = useRef(0);
	const maxAttempts = 3;

	const { data, isLoading, isError } = useQuery({
		queryKey: ['serverTime'],
		queryFn: async () => {
			const clientBefore = Date.now();
			const response = await fetch('/api/time');
			const data: ServerTimeResponse = await response.json();
			const clientAfter = Date.now();

			const roundTrip = clientAfter - clientBefore;
			const estimatedServerTime = data.serverTime + roundTrip / 2;
			const newOffset = estimatedServerTime - clientAfter;

			return { data, offset: newOffset, roundTrip };
		},
		enabled,
		retry: 2,
		staleTime: 60000,
	});

	useEffect(() => {
		if (!enabled || isLoading || isError) return;

		if (data && syncAttempts.current < maxAttempts) {
			setOffset(data.offset);
			setIsSynced(true);
			syncAttempts.current += 1;
		}
	}, [data, enabled, isLoading, isError]);

	const getServerTime = () => {
		return Date.now() + offset;
	};

	const getRemainingTime = (endTime: number) => {
		const serverNow = getServerTime();
		return Math.max(0, endTime - serverNow);
	};

	return {
		offset,
		isSynced,
		isLoading,
		isError,
		getServerTime,
		getRemainingTime,
		roundTrip: data?.roundTrip,
	};
}
