'use client';

import { domAnimation, LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AblyClientProvider } from '@/lib/ably/provider';
import AppLayout from './AppLayout';

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<LazyMotion features={domAnimation}>
			<TooltipProvider>
				<AblyClientProvider>
					<NotificationListener>
						<AppLayout>{children}</AppLayout>
					</NotificationListener>
				</AblyClientProvider>
			</TooltipProvider>
		</LazyMotion>
	);
}
