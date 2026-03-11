'use client';

import {
	AiBrain01Icon,
	AlertCircleIcon,
	ArrowDown01Icon,
	ArrowRight01Icon,
	AtomIcon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Calendar01Icon,
	ChampionIcon,
	Chat01Icon,
	File01Icon,
	WorkoutSportIcon as GamePlayer01Icon,
	GlobeIcon,
	Home01Icon,
	Key01Icon,
	Layers01Icon,
	LayoutLeftIcon,
	Logout01Icon,
	MapsIcon,
	Medal01Icon,
	MoonIcon,
	Notification03Icon,
	QuestionIcon,
	Search01Icon,
	Settings01Icon,
	Shield01Icon,
	SparklesIcon,
	Sun01Icon,
	Task01Icon,
	UserIcon as User,
	UserGroupIcon,
	UserAdd01Icon as UserPlus,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	useSidebar,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { ProfileMenu } from './profile-menu';

type AuthUser = typeof authClient.$Infer.Session.user;

type MenuItem = {
	href: string;
	label: string;
	icon: any;
};

type MenuSection = {
	title: string;
	items: MenuItem[];
};

export const sideMenuSections: MenuSection[] = [
	{
		title: 'Learning & Study',
		items: [
			{ href: '/dashboard', label: 'Dashboard', icon: Home01Icon },
			{ href: '/search', label: 'Search', icon: Search01Icon },
			{ href: '/lessons', label: 'Lessons', icon: BookOpen01Icon },
			{ href: '/physics', label: 'Physics', icon: AtomIcon },
			{ href: '/study-companion', label: 'Study Companion', icon: SparklesIcon },
			{ href: '/study-path', label: 'Study Path', icon: MapsIcon },
			{ href: '/study-plan', label: 'Study Plan', icon: Calendar01Icon },
		],
	},
	{
		title: 'Practice & Quizzes',
		items: [
			{ href: '/past-papers', label: 'Past Papers', icon: File01Icon },
			{ href: '/interactive-quiz', label: 'Interactive Quiz', icon: GamePlayer01Icon },
			{ href: '/quiz', label: 'Quiz', icon: QuestionIcon },
			{ href: '/math-quiz', label: 'Math Quiz', icon: CalculatorIcon },
			{ href: '/physics-quiz', label: 'Physics Quiz', icon: AtomIcon },
			{ href: '/practice-quiz', label: 'Practice Quiz', icon: Task01Icon },
			{ href: '/flashcards', label: 'Flashcards', icon: Layers01Icon },
			{ href: '/review', label: 'Review Dashboard', icon: AiBrain01Icon },
		],
	},
	{
		title: 'Social & Community',
		items: [
			{ href: '/channels', label: 'Study Channels', icon: UserGroupIcon },
			{ href: '/study-buddies', label: 'Study Buddies', icon: UserPlus },
			{ href: '/comments', label: 'Comments', icon: Chat01Icon },
			{ href: '/leaderboard', label: 'Leaderboard', icon: ChampionIcon },
			{ href: '/achievements', label: 'Achievements', icon: Medal01Icon },
		],
	},
	{
		title: 'Account & Settings',
		items: [
			{ href: '/profile', label: 'My Profile', icon: User },
			{ href: '/bookmarks', label: 'Bookmarks', icon: BookmarkIcon },
			{ href: '/notifications', label: 'Notifications', icon: Notification03Icon },
			{ href: '/calendar', label: 'Calendar', icon: Calendar01Icon },
			{ href: '/language', label: 'Language', icon: GlobeIcon },
			{ href: '/2fa', label: 'Two-Factor Auth', icon: Key01Icon },
			{ href: '/settings', label: 'Settings', icon: Settings01Icon },
			{ href: '/onboarding', label: 'Test Onboarding', icon: SparklesIcon },
		],
	},
	{
		title: 'Admin',
		items: [
			{ href: '/admin', label: 'Admin Panel', icon: Shield01Icon },
			{ href: '/admin/moderation', label: 'Admin Moderation', icon: AlertCircleIcon },
			{ href: '/cms', label: 'Content Management', icon: LayoutLeftIcon },
		],
	},
];

export const sideMenuItems = sideMenuSections.flatMap((section) => section.items);

type AppSidebarProps = {
	user: AuthUser;
	pathname: string;
	theme: string;
	onToggleTheme: () => void;
};

export function AppSidebar({ user, pathname, theme, onToggleTheme }: AppSidebarProps) {
	const { setOpenMobile } = useSidebar();
	const [searchQuery, setSearchQuery] = useState('');
	const [openSection, setOpenSection] = useState<string | null>(null);

	const filteredSections = useMemo(() => {
		if (!searchQuery.trim()) return sideMenuSections;

		const query = searchQuery.toLowerCase();
		return sideMenuSections
			.map((section) => ({
				...section,
				items: section.items.filter((item) => item.label.toLowerCase().includes(query)),
			}))
			.filter((section) => section.items.length > 0);
	}, [searchQuery]);

	useEffect(() => {
		if (searchQuery.trim() && filteredSections.length > 0) {
			const hasOpenSection = filteredSections.some((s) => s.title === openSection);
			if (!hasOpenSection) {
				setOpenSection(filteredSections[0].title);
			}
		}
	}, [searchQuery, filteredSections, openSection]);

	const handleSectionToggle = (sectionTitle: string) => {
		setOpenSection((current) => (current === sectionTitle ? null : sectionTitle));
	};

	const handleLinkClick = () => {
		setOpenMobile(false);
	};

	return (
		<Sidebar collapsible="offcanvas" variant="sidebar">
			<SidebarHeader className="border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
				<Link href="/dashboard" className="block px-2 py-3">
					<h1 className="text-lg font-black text-sidebar-foreground uppercase tracking-tighter">
						MatricMaster
					</h1>
					<p className="text-sidebar-foreground/60 font-bold text-[10px] uppercase tracking-wide">
						Level up your learning
					</p>
				</Link>
				<div className="relative flex items-center px-2 pb-3">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-5 w-4 h-4 text-sidebar-foreground/40"
					/>
					<Input
						placeholder="Search menu..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-9 bg-sidebar-accent/50 placeholder:text-xs border-sidebar-border focus-visible:ring-sidebar-ring"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-2">
				{filteredSections.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-sidebar-foreground/50">
						<HugeiconsIcon icon={Search01Icon} className="w-8 h-8 mb-2" />
						<p className="text-sm">No results found</p>
					</div>
				) : (
					filteredSections.map((section) => (
						<SidebarGroup key={section.title}>
							<Collapsible
								open={openSection === section.title}
								onOpenChange={() => handleSectionToggle(section.title)}
							>
								<CollapsibleTrigger asChild>
									<SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent rounded-md select-none flex items-center justify-between pr-2">
										<span>{section.title}</span>
										{openSection === section.title ? (
											<HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4" />
										) : (
											<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
										)}
									</SidebarGroupLabel>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarGroupContent>
										<SidebarMenu>
											{section.items.map((item) => {
												const isActive = pathname === item.href;
												return (
													<SidebarMenuItem key={item.href}>
														<SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
															<Link href={item.href} onClick={handleLinkClick}>
																<HugeiconsIcon icon={item.icon} className="w-4 h-4" />
																<span>{item.label}</span>
															</Link>
														</SidebarMenuButton>
													</SidebarMenuItem>
												);
											})}
										</SidebarMenu>
									</SidebarGroupContent>
								</CollapsibleContent>
							</Collapsible>
						</SidebarGroup>
					))
				)}
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border p-3">
				<ThemeToggle theme={theme} onToggle={onToggleTheme} />
				<SidebarSeparator className="my-2" />
				<UserProfileSection user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}

type ThemeToggleProps = {
	theme: string;
	onToggle: () => void;
};

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
	return (
		<div className="flex items-center justify-between p-2 bg-sidebar-accent/50 rounded-md pl-6">
			<span className="text-xs font-medium text-sidebar-foreground/70">Theme</span>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 hover:bg-sidebar-accent"
				onClick={onToggle}
				aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
			>
				{theme === 'dark' ? (
					<HugeiconsIcon icon={Sun01Icon} className="w-4 h-4 text-yellow-500" />
				) : (
					<HugeiconsIcon icon={MoonIcon} className="w-4 h-4 text-sidebar-foreground/70" />
				)}
			</Button>
		</div>
	);
}

type UserProfileSectionProps = {
	user: AuthUser;
};

function UserProfileSection({ user }: UserProfileSectionProps) {
	return (
		<ProfileMenu user={user}>
			<button
				type="button"
				className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors"
			>
				<Avatar className="h-9 w-9 border-2 border-sidebar-border">
					<AvatarImage src={user.image || undefined} alt={user.name} />
					<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
						{user.name?.charAt(0)?.toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 text-left overflow-hidden min-w-0">
					<p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
					<p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
				</div>
			</button>
		</ProfileMenu>
	);
}

export async function handleLogout() {
	await authClient.signOut();
	window.location.href = '/sign-in';
}

export function LogoutButton() {
	return (
		<Button
			variant="ghost"
			className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
			onClick={handleLogout}
		>
			<HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
			<span>Logout</span>
		</Button>
	);
}
