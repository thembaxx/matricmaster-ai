'use client';

import { useQuery } from '@tanstack/react-query';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

interface SmartSchedulerProviderProps {
	children: React.ReactNode;
}

async function fetchSchedule() {
	const response = await fetch('/api/smart-scheduler/blocks');
	if (!response.ok) throw new Error('Failed to fetch schedule');
	return response.json();
}

export function SmartSchedulerProvider({ children }: SmartSchedulerProviderProps) {
	const setBlocks = useSmartSchedulerStore((s) => s.setBlocks);
	const setExams = useSmartSchedulerStore((s) => s.setExams);
	const setLoading = useSmartSchedulerStore((s) => s.setLoading);

	useQuery({
		queryKey: ['smart-scheduler-blocks'],
		queryFn: async () => {
			setLoading(true);
			const data = await fetchSchedule();
			setBlocks(data.blocks || []);
			setExams(data.exams || []);
			setLoading(false);
			return data;
		},
	});

	return <>{children}</>;
}
