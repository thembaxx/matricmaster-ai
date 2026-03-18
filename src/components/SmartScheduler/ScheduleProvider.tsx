'use client';

import { useEffect } from 'react';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

interface SmartSchedulerProviderProps {
	children: React.ReactNode;
}

export function SmartSchedulerProvider({ children }: SmartSchedulerProviderProps) {
	const { loadSchedule } = useSmartSchedulerStore();

	useEffect(() => {
		loadSchedule();
	}, [loadSchedule]);

	return <>{children}</>;
}
