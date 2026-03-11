'use client';

import { domAnimation, LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AblyClientProvider } from '@/lib/ably/provider';
import { ScheduleProvider } from '@/stores/useScheduleStore';
import AppLayout from './AppLayout';
import QueryErrorBoundary from './QueryErrorBoundary';
import QueryProvider from './QueryProvider';

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<QueryErrorBoundary>
			<QueryProvider>
				<LazyMotion features={domAnimation}>
					<TooltipProvider>
						<AblyClientProvider>
							<ScheduleProvider>
								<NotificationListener>
									<AppLayout>{children}</AppLayout>
								</NotificationListener>
							</ScheduleProvider>
						</AblyClientProvider>
					</TooltipProvider>
				</LazyMotion>
			</QueryProvider>
		</QueryErrorBoundary>
	);
}
