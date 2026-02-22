'use client';

import { domAnimation, LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { AblyClientProvider } from '@/lib/ably/provider';
import AppLayout from './AppLayout';

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<LazyMotion features={domAnimation}>
			<AblyClientProvider>
				<NotificationListener>
					<AppLayout>{children}</AppLayout>
				</NotificationListener>
			</AblyClientProvider>
		</LazyMotion>
	);
}
