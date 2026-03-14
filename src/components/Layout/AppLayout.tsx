'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ClientOnly } from '@/components/ClientOnly';
import { DailyLoginBonus } from '@/components/Gamification/DailyLoginBonus';
import { MobileLayoutFixes } from '@/components/Layout/MobileLayoutFixes';
// import { MobileViewTest } from '@/components/Layout/MobileViewTest';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { useNotificationStore } from '@/stores/useNotificationStore';
import PageTransition from '../Transition/PageTransition';
import { BottomNavigation } from './BottomNavigation';
import { AppSidebar } from './DesktopSidebar';
import { MobileMenuSheet } from './MobileMenuSheet';
import { ResponsiveHeader } from './ResponsiveHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const { unreadCount } = useNotificationStore();
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const hideNavigation = ['/test', '/onboarding', '/sign-in', '/sign-up', '/interactive-quiz'];
	const hideBottomNavigation = [
		'/sign-in',
		'/sign-up',
		'/test',
		'/interactive-quiz',
		'/onboarding',
	];

	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));
	const shouldHideBottomNav = hideBottomNavigation.some((path) => pathname.startsWith(path));

	const isFullScreen = pathname.startsWith('/past-paper') && searchParams.get('id');

	if (!user || shouldHideNav) {
		return (
			<div className="flex min-h-screen bg-background overflow-x-hidden transition-colors duration-500">
				{/* <ClientOnly>{user && <DailyLoginBonus />}</ClientOnly> */}
				<ClientOnly>
					<MobileLayoutFixes />
					{/* <MobileViewTest /> */}
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
							{children}
						</main>
					</div>
					{!shouldHideBottomNav && (user || pathname === '/') && (
						<BottomNavigation pathname={pathname} />
					)}
				</div>
				<GlobalStyles />
			</div>
		);
	}

	return (
		<SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
			<ClientOnly>
				<DailyLoginBonus />
				<MobileLayoutFixes />
				{/* <MobileViewTest /> */}
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
								mobileMenuTrigger={<MobileMenuSheet />}
							/>
						)}
						<main id="main-content" className={'flex-1 relative flex flex-col pt-16 lg:pt-8'}>
							{children}
						</main>
					</div>
					{!shouldHideBottomNav && !isFullScreen && (user || pathname === '/') && (
						<BottomNavigation pathname={pathname} />
					)}
				</div>
			</SidebarInset>
			<GlobalStyles />
		</SidebarProvider>
	);
}

function GlobalStyles() {
	return (
		<style jsx global>{`
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
    `}</style>
	);
}
