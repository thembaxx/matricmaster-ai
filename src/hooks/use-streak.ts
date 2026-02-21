'use client';

import { useEffect, useState } from 'react';
import { getUserStreak } from '@/lib/db/progress-actions';

export interface StreakData {
	currentStreak: number;
	bestStreak: number;
	lastActivityDate: string | null;
	isLoading: boolean;
}

export function useStreak(): StreakData {
	const [data, setData] = useState<StreakData>({
		currentStreak: 0,
		bestStreak: 0,
		lastActivityDate: null,
		isLoading: true,
	});

	useEffect(() => {
		async function fetchStreak() {
			try {
				const result = await getUserStreak();
				setData({
					currentStreak: result.currentStreak,
					bestStreak: result.bestStreak,
					lastActivityDate: result.lastActivityDate,
					isLoading: false,
				});
			} catch (error) {
				console.error('[useStreak] Error fetching streak:', error);
				setData((prev) => ({ ...prev, isLoading: false }));
			}
		}

		fetchStreak();
	}, []);

	return data;
}
