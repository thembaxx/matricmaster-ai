'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { GeminiQuotaErrorModal } from '@/components/AI/GeminiQuotaErrorModal';
import { GlassOrb } from '@/components/AI/GlassOrb';
import { FloatingWidget } from '@/components/Chat/FloatingWidget';
import { ClientOnly } from '@/components/ClientOnly';
import { DailyLoginBonus } from '@/components/Gamification/DailyLoginBonus';
import { MobileLayoutFixes } from '@/components/Layout/MobileLayoutFixes';
import { Button } from '@/components/ui/button';
import { ConfettiProvider } from '@/components/ui/ConfettiProvider';
import { SubjectBackgroundProvider } from '@/components/ui/SubjectBackground';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { useNotificationStore } from '@/stores/useNotificationStore';
import type { Theme } from '@/stores/useThemeStore';
import PageTransition from '../Transition/PageTransition';
import { BottomNavigation } from './BottomNavigation';
import { AppSidebar } from './DesktopSidebar';
import { MobileNavDrawer } from './MobileNavDrawer';
import { ResponsiveHeader } from './ResponsiveHeader';

function QuotaErrorModal() {
	const { showQuotaModal, hideQuotaModal, errorState } = useGeminiQuotaModal();
	return (
		<GeminiQuotaErrorModal
			open={showQuotaModal}
			onOpenChange={hideQuotaModal}
			errorState={errorState}
		/>
	);
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const { unreadCount } = useNotificationStore();
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const hideNavigation = ['/onboarding', '/sign-in', '/sign-up'];
	const hideBottomNavigation = ['/sign-in', '/sign-up', '/onboarding'];

	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));
	const shouldHideBottomNav = hideBottomNavigation.some((path) => pathname.startsWith(path));

	const isFullScreen = pathname.startsWith('/past-paper') && searchParams.get('id');

	if (!user || shouldHideNav) {
		return (
			<ConfettiProvider>
				<SubjectBackgroundProvider>
					<div className="flex min-h-screen bg-background overflow-x-hidden transition-colors duration-500">
						<ClientOnly>{user && <DailyLoginBonus />}</ClientOnly>
						<ClientOnly>
							<MobileLayoutFixes />
						</ClientOnly>
						<div className="flex-1 flex flex-col min-h-screen relative max-w-full">
							<GlobalStyles />
							<div className="flex-1 flex flex-col w-full mx-auto max-w-full">
								{!shouldHideNav && (
									<ResponsiveHeader
										user={user ?? null}
										unreadCount={unreadCount}
										onNotificationClick={() => {
											if (!user) {
												toast.info('login required', {
													description: 'please sign in to view your notifications.',
												});
												router.push('/sign-in');
												return;
											}
											router.push('/notifications');
										}}
										onSignIn={() => router.push('/sign-in')}
										onSignUp={() => router.push('/sign-up')}
									/>
								)}
								<main
									className={`flex-1 relative flex flex-col ${!shouldHideNav ? 'pt-20' : ''} ${!shouldHideBottomNav ? 'pb-40' : ''}`}
								>
									<PageTransition>{children}</PageTransition>
								</main>
							</div>
							{!shouldHideBottomNav && user && <BottomNavigation pathname={pathname} />}
						</div>
						<GlassOrb />
					</div>
				</SubjectBackgroundProvider>
			</ConfettiProvider>
		);
	}

	return (
		<SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
			<ConfettiProvider>
				<SubjectBackgroundProvider>
					<ClientOnly>
						<DailyLoginBonus />
						<MobileLayoutFixes />
					</ClientOnly>
					<AppSidebar
						user={user}
						pathname={pathname}
						theme={theme}
						onSetTheme={(t: Theme) => setTheme(t)}
					/>
					<SidebarInset>
						<div className="flex-1 flex flex-col min-h-screen relative max-w-full">
							<div className="flex-1 flex flex-col w-full mx-auto transition-all duration-300 max-w-7xl lg:px-8 xl:px-12">
								{!isFullScreen && (
									<ResponsiveHeader
										user={user ?? null}
										unreadCount={unreadCount}
										onNotificationClick={() => {
											if (!user) {
												toast.info('login required', {
													description: 'please sign in to view your notifications.',
												});
												router.push('/sign-in');
												return;
											}
											router.push('/notifications');
										}}
										onSignIn={() => router.push('/sign-in')}
										onSignUp={() => router.push('/sign-up')}
										mobileMenuTrigger={
											<MobileNavDrawer
												user={user}
												theme={theme}
												onSetTheme={(t: Theme) => setTheme(t)}
											>
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-tiimo hover:bg-card active:scale-95"
													aria-label="open navigation menu"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="20"
														height="20"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														aria-hidden="true"
													>
														<title>menu</title>
														<line x1="4" x2="20" y1="12" y2="12" />
														<line x1="4" x2="20" y1="6" y2="6" />
														<line x1="4" x2="20" y1="18" y2="18" />
													</svg>
												</Button>
											</MobileNavDrawer>
										}
									/>
								)}
								<main
									className={`flex-1 relative flex flex-col pt-16 lg:pt-8 ${!shouldHideBottomNav && !isFullScreen ? 'pb-40' : ''}`}
								>
									<PageTransition>{children}</PageTransition>
								</main>
							</div>
							{!shouldHideBottomNav && !isFullScreen && user && (
								<BottomNavigation pathname={pathname} />
							)}
						</div>
						<ClientOnly>
							<QuotaErrorModal />
						</ClientOnly>
					</SidebarInset>
					<GlassOrb />
					<FloatingWidget />
				</SubjectBackgroundProvider>
			</ConfettiProvider>
		</SidebarProvider>
	);
}

function AppLayoutSkeleton() {
	return (
		<div className="flex min-h-screen bg-background overflow-x-hidden">
			<div className="flex-1 flex flex-col min-h-screen relative max-w-full">
				<div className="flex-1 flex flex-col w-full mx-auto max-w-full pt-20 pb-40">
					<div className="animate-pulse flex flex-col gap-4 p-4">
						<div className="h-8 bg-muted rounded w-1/4" />
						<div className="h-64 bg-muted rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<Suspense fallback={<AppLayoutSkeleton />}>
			<AppLayoutContent>{children}</AppLayoutContent>
		</Suspense>
	);
}

function GlobalStyles() {
	return (
		<style>
			{`
			.no-scrollbar::-webkit-scrollbar {
				display: none;
			}
			.no-scrollbar {
				-ms-overflow-style: none;
				scrollbar-width: none;
			}

			::selection {
				background-color: var(--primary);
				color: var(--primary-foreground);
			}
		`}
		</style>
	);
}
