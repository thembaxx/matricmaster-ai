'use client';

import { Settings01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarSeparator,
	useSidebar,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import type { Theme } from '@/stores/useThemeStore';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarSearchInput } from './SidebarSearchInput';
import { SidebarThemeToggle } from './SidebarThemeToggle';
import { SidebarUserProfile } from './SidebarUserProfile';
import { useSidebarMenu } from './useSidebarMenu';

type AuthUser = typeof authClient.$Infer.Session.user;

type AppSidebarProps = {
	user: AuthUser;
	pathname: string;
	theme: string;
	onSetTheme: (theme: Theme) => void;
};

export function AppSidebar({ user, pathname, theme, onSetTheme }: AppSidebarProps) {
	const { setOpenMobile } = useSidebar();
	const { searchQuery, setSearchQuery, openSection, filteredSections, handleSectionToggle } =
		useSidebarMenu();

	const handleLinkClick = () => {
		setOpenMobile(false);
	};

	return (
		<Sidebar collapsible="offcanvas" variant="sidebar">
			<SidebarHeader className="border-b-0 px-4 pt-4 pb-2">
				<SidebarSearchInput value={searchQuery} onChange={setSearchQuery} />
			</SidebarHeader>

			<SidebarContent className="px-3">
				<SidebarNavigation
					filteredSections={filteredSections}
					openSection={openSection}
					onSectionToggle={handleSectionToggle}
					pathname={pathname}
					onLinkClick={handleLinkClick}
				/>
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border/50 p-3 space-y-2">
				<SidebarThemeToggle theme={theme} onSetTheme={onSetTheme} />
				<SidebarSeparator className="bg-sidebar-border/50" />
				<SidebarUserProfile user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}

export function LogoutButton() {
	const router = useRouter();

	const handleLogout = async () => {
		await authClient.signOut();
		router.push('/sign-in');
		router.refresh();
	};

	return (
		<Button
			variant="ghost"
			className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-primary"
			onClick={handleLogout}
		>
			<HugeiconsIcon icon={Settings01Icon} className="w-4 h-4" />
			<span>logout</span>
		</Button>
	);
}
