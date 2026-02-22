'use client';

import { ClientOnly } from '@/components/ClientOnly';
import { DailyLoginBonus } from '@/components/Gamification/DailyLoginBonus';
import { useNotificationContextSafe } from '@/components/Notifications/NotificationListener';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import PageTransition from '../Transition/PageTransition';
import { BottomNavigation } from './BottomNavigation';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileMenuSheet } from './MobileMenuSheet';
import { ResponsiveHeader } from './ResponsiveHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const { unreadCount } = useNotificationContextSafe();
	const [sheetOpen, setSheetOpen] = useState(false);

	const hideNavigation = ['/test'];
	const hideBottomNavigation = ['/sign-in', '/sign-up', '/test'];

	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));
	const shouldHideBottomNav = hideBottomNavigation.some((path) => pathname.startsWith(path));

	return (
		<div className="flex min-h-screen bg-background overflow-x-hidden transition-colors duration-500">
			<ClientOnly>{user && <DailyLoginBonus />}</ClientOnly>

			{user && !shouldHideNav && (
				<DesktopSidebar
					user={user}
					pathname={pathname}
					theme={theme}
					onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				/>
			)}

			<div className="flex-1 flex flex-col min-h-screen relative max-w-full">
				<div
					className={`flex-1 flex flex-col w-full mx-auto transition-all duration-300 ${!shouldHideNav && user ? 'max-w-7xl lg:px-8 xl:px-12' : 'max-w-full'}`}
				>
					{!shouldHideNav && (
						<ResponsiveHeader
							user={user ?? null}
							unreadCount={unreadCount}
							onNotificationClick={() => router.push('/notifications')}
							onSignIn={() => router.push('/sign-in')}
							onSignUp={() => router.push('/sign-up')}
							mobileMenuTrigger={
								<MobileMenuSheet open={sheetOpen} onOpenChange={setSheetOpen} pathname={pathname} />
							}
						/>
					)}

					<main
						id="main-content"
						className={`flex-1 relative flex flex-col ${!shouldHideNav ? 'pt-20 lg:pt-0' : ''}`}
					>
						<PageTransition>{children}</PageTransition>
					</main>
				</div>

				{!shouldHideBottomNav && user && <BottomNavigation pathname={pathname} />}
			</div>

			<GlobalStyles />
		</div>
	);
}

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

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
