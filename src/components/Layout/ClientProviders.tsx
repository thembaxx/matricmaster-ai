'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { domAnimation, LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { GeminiQuotaModalProvider } from '@/contexts/GeminiQuotaModalContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AblyClientProvider } from '@/lib/ably/provider';
import { queryClient } from '@/lib/api/client';
import { MapProvider } from '@/lib/map-provider';
import { PostHogProvider } from '@/lib/posthog-client';
import { ScheduleProvider } from '@/stores/useScheduleStore';
import AppLayout from './AppLayout';

interface ClientProvidersProps {
	children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<LazyMotion features={domAnimation}>
				<TooltipProvider>
					<AblyClientProvider>
						<ScheduleProvider>
							<PostHogProvider>
								<NotificationListener>
									<GeminiQuotaModalProvider>
										<OfflineProvider>
											<FocusModeProvider>
												<MapProvider>
													<SettingsProvider>
														<AppLayout>{children}</AppLayout>
													</SettingsProvider>
												</MapProvider>
											</FocusModeProvider>
										</OfflineProvider>
									</GeminiQuotaModalProvider>
								</NotificationListener>
							</PostHogProvider>
						</ScheduleProvider>
					</AblyClientProvider>
				</TooltipProvider>
			</LazyMotion>
		</QueryClientProvider>
	);
}
