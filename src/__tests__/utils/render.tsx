import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type RenderHookOptions, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { GeminiQuotaModalProvider } from '@/contexts/GeminiQuotaModalContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AblyClientProvider } from '@/lib/ably/provider';
import { ScheduleProvider } from '@/stores/useScheduleStore';
import { createAuthenticatedSession, type MockSessionUser, setMockSession } from '../mocks/auth';
import '../setup';

const defaultQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			gcTime: 0,
		},
	},
});

interface WrapperProps {
	children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
	return (
		<QueryClientProvider client={defaultQueryClient}>
			<TooltipProvider>
				<AblyClientProvider>
					<ScheduleProvider>
						<GeminiQuotaModalProvider>
							<OfflineProvider>
								<FocusModeProvider>
									<SettingsProvider>{children}</SettingsProvider>
								</FocusModeProvider>
							</OfflineProvider>
						</GeminiQuotaModalProvider>
					</ScheduleProvider>
				</AblyClientProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
}

interface AuthenticatedWrapperProps extends WrapperProps {
	user?: MockSessionUser;
}

function AuthenticatedProviders({ children, user }: AuthenticatedWrapperProps) {
	setMockSession(user ?? createAuthenticatedSession().data?.user ?? undefined);

	return (
		<QueryClientProvider client={defaultQueryClient}>
			<TooltipProvider>
				<AblyClientProvider>
					<ScheduleProvider>
						<GeminiQuotaModalProvider>
							<OfflineProvider>
								<FocusModeProvider>
									<SettingsProvider>{children}</SettingsProvider>
								</FocusModeProvider>
							</OfflineProvider>
						</GeminiQuotaModalProvider>
					</ScheduleProvider>
				</AblyClientProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export interface RenderWithProvidersOptions {
	authenticated?: boolean;
	user?: MockSessionUser;
}

export function renderWithProviders(
	ui: React.ReactElement,
	options: RenderWithProvidersOptions = {}
) {
	const { authenticated = false, user } = options;

	if (authenticated) {
		return {
			...require('@testing-library/react').render(ui, {
				wrapper: (props: WrapperProps) => <AuthenticatedProviders {...props} user={user} />,
			}),
		};
	}

	return {
		...require('@testing-library/react').render(ui, {
			wrapper: AllProviders,
		}),
	};
}

export function renderHookWithProviders<TProps, TResult>(
	hook: (props: TProps) => TResult,
	options?: RenderHookOptions<TProps> & { authenticated?: boolean; user?: MockSessionUser }
) {
	const { authenticated = false, user, ...renderOptions } = options ?? {};

	if (authenticated) {
		return renderHook(hook, {
			...renderOptions,
			wrapper: (props: WrapperProps) => <AuthenticatedProviders {...props} user={user} />,
		});
	}

	return renderHook(hook, {
		...renderOptions,
		wrapper: AllProviders,
	});
}

export { AllProviders, AuthenticatedProviders, defaultQueryClient };
