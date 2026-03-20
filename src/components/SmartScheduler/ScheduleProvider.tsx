'use client';

import { useQuery } from '@tanstack/react-query';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

interface SmartSchedulerProviderProps {
	children: React.ReactNode;
}

export function SmartSchedulerProvider({ children }: SmartSchedulerProviderProps) {
	const setBlocks = useSmartSchedulerStore((s) => s.setBlocks);
	const setExams = useSmartSchedulerStore((s) => s.setExams);
	const setLoading = useSmartSchedulerStore((s) => s.setLoading);

	useQuery({
		queryKey: ['smart-scheduler-blocks'],
		queryFn: async () => {
			setLoading(true);
			try {
				const response = await fetch('/api/smart-scheduler/blocks');
				if (!response.ok) throw new Error('Failed to fetch schedule');
				const data = await response.json();
				setBlocks(data.blocks || []);
				setExams(data.exams || []);
				return data;
			} finally {
				setLoading(false);
			}
		},
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});

	return <>{children}</>;
}
