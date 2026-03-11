'use client';

import { AnimatePresence, domAnimation, LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AblyClientProvider } from '@/lib/ably/provider';
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
							<NotificationListener>
								<AppLayout>
									<AnimatePresence mode="wait" initial={false}>
										{children}
									</AnimatePresence>
								</AppLayout>
							</NotificationListener>
						</AblyClientProvider>
					</TooltipProvider>
				</LazyMotion>
			</QueryProvider>
		</QueryErrorBoundary>
	);
}
