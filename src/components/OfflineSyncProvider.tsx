'use client';

import { useNotificationTriggers } from '@/lib/hooks/useNotificationTriggers';
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
	useOfflineSync();
	useNotificationTriggers();

	return <>{children}</>;
}
