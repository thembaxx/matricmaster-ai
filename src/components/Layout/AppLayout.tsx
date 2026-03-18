'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { GeminiQuotaErrorModal } from '@/components/AI/GeminiQuotaErrorModal';
import { GlassOrb } from '@/components/AI/GlassOrb';
import { FloatingWidget } from '@/components/Chat/FloatingWidget';
import { ClientOnly } from '@/components/ClientOnly';
import { DailyLoginBonus } from '@/components/Gamification/DailyLoginBonus';
import { MobileLayoutFixes } from '@/components/Layout/MobileLayoutFixes';
import { ConfettiProvider } from '@/components/ui/ConfettiProvider';
import { SubjectBackgroundProvider } from '@/components/ui/SubjectBackground';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { useNotificationStore } from '@/stores/useNotificationStore';
import PageTransition from '../Transition/PageTransition';
import { BottomNavigation } from './BottomNavigation';
import { AppSidebar } from './DesktopSidebar';
import { MobileNavDrawer } from './MobileNavDrawer';
import { ResponsiveHeader } from './ResponsiveHeader';

function QuotaErrorModal() {
	const { showQuotaModal, hideQuotaModal } = useGeminiQuotaModal();
	return <GeminiQuotaErrorModal open={showQuotaModal} onOpenChange={hideQuotaModal} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
							<div className="flex-1 flex flex-col w-full mx-auto max-w-full">
								{!shouldHideNav && (
									<ResponsiveHeader
										user={user ?? null}
										unreadCount={unreadCount}
										onNotificationClick={() => {
											if (!user) {
												toast.info('Login Required', {
													description: 'Please sign in to view your notifications.',
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
									id="main-content"
									className={`flex-1 relative flex flex-col ${!shouldHideNav ? 'pt-20' : ''} ${!shouldHideBottomNav ? 'pb-40' : ''}`}
								>
									<PageTransition>{children}</PageTransition>
								</main>
							</div>
							{!shouldHideBottomNav && (user || pathname === '/') && (
								<BottomNavigation pathname={pathname} />
							)}
						</div>
						<GlassOrb />
						<GlobalStyles />
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
						onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
												toast.info('Login Required', {
													description: 'Please sign in to view your notifications.',
												});
												router.push('/sign-in');
												return;
											}
											router.push('/notifications');
										}}
										onSignIn={() => router.push('/sign-in')}
										onSignUp={() => router.push('/sign-up')}
										mobileMenuTrigger={
											<MobileNavDrawer user={user}>
												<button
													type="button"
													className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-tiimo hover:bg-card active:scale-95 transition-all flex items-center justify-center"
													aria-label="Open navigation menu"
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
														<title>Menu</title>
														<line x1="4" x2="20" y1="12" y2="12" />
														<line x1="4" x2="20" y1="6" y2="6" />
														<line x1="4" x2="20" y1="18" y2="18" />
													</svg>
												</button>
											</MobileNavDrawer>
										}
									/>
								)}
								<main id="main-content" className={'flex-1 relative flex flex-col pt-16 lg:pt-8'}>
									<PageTransition>{children}</PageTransition>
								</main>
							</div>
							{!shouldHideBottomNav && !isFullScreen && (user || pathname === '/') && (
								<BottomNavigation pathname={pathname} />
							)}
						</div>
						<ClientOnly>
							<QuotaErrorModal />
						</ClientOnly>
						<GlobalStyles />
					</SidebarInset>
					<GlassOrb />
					<FloatingWidget />
				</SubjectBackgroundProvider>
			</ConfettiProvider>
			<GlobalStyles />
		</SidebarProvider>
	);
}

function GlobalStyles() {
	// eslint-disable-next-line react/no-danger
	return (
		<style
			dangerouslySetInnerHTML={{
				__html: `
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
		`,
			}}
		/>
	);
}
