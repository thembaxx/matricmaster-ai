'use client';

import { domAnimation, LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GeminiQuotaModalProvider } from '@/contexts/GeminiQuotaModalContext';
import { AblyClientProvider } from '@/lib/ably/provider';
import { PostHogProvider } from '@/lib/posthog-client';
import { ScheduleProvider } from '@/stores/useScheduleStore';
import AppLayout from './AppLayout';

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<LazyMotion features={domAnimation}>
			<TooltipProvider>
				<AblyClientProvider>
					<ScheduleProvider>
						<PostHogProvider>
							<NotificationListener>
								<GeminiQuotaModalProvider>
									<AppLayout>{children}</AppLayout>
								</GeminiQuotaModalProvider>
							</NotificationListener>
						</PostHogProvider>
					</ScheduleProvider>
				</AblyClientProvider>
			</TooltipProvider>
		</LazyMotion>
	);
}
