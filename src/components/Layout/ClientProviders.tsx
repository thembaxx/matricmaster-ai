'use client';

import type { ReactNode } from 'react';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { AblyClientProvider } from '@/lib/ably/provider';
import AppLayout from './AppLayout';

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<AblyClientProvider>
			<NotificationListener>
				<AppLayout>{children}</AppLayout>
			</NotificationListener>
		</AblyClientProvider>
	);
}
