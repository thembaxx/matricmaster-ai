'use client';

import {
	Atom,
	Award,
	Bell,
	Bookmark,
	BookOpen,
	Brain,
	Calculator,
	Calendar,
	CalendarDays,
	ChevronDown,
	ChevronRight,
	ClipboardList,
	FileText,
	Gamepad2,
	Globe,
	HelpCircle,
	Home,
	Key,
	Layers,
	Layout,
	LogOut,
	Map as MapIcon,
	MessageCircle,
	Moon,
	Search as SearchIcon,
	Settings,
	Shield,
	ShieldAlert,
	Sparkles,
	Sun,
	Trophy,
	User as UserIcon,
	UserPlus,
	Users,
} from 'lucide-react';
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
	icon: React.ComponentType<{ className?: string }>;
};

type MenuSection = {
	title: string;
	items: MenuItem[];
};

export const sideMenuSections: MenuSection[] = [
	{
		title: 'Learning & Study',
		items: [
			{ href: '/dashboard', label: 'Dashboard', icon: Home },
			{ href: '/search', label: 'Search', icon: SearchIcon },
			{ href: '/lessons', label: 'Lessons', icon: BookOpen },
			{ href: '/physics', label: 'Physics', icon: Atom },
			{ href: '/ai-tutor', label: 'AI Tutor', icon: Sparkles },
			{ href: '/study-path', label: 'Study Path', icon: MapIcon },
			{ href: '/study-plan', label: 'Study Plan', icon: Calendar },
		],
	},
	{
		title: 'Practice & Quizzes',
		items: [
			{ href: '/past-papers', label: 'Past Papers', icon: FileText },
			{ href: '/interactive-quiz', label: 'Interactive Quiz', icon: Gamepad2 },
			{ href: '/quiz', label: 'Quiz', icon: HelpCircle },
			{ href: '/math-quiz', label: 'Math Quiz', icon: Calculator },
			{ href: '/physics-quiz', label: 'Physics Quiz', icon: Atom },
			{ href: '/practice-quiz', label: 'Practice Quiz', icon: ClipboardList },
			{ href: '/flashcards', label: 'Flashcards', icon: Layers },
			{ href: '/review', label: 'Review Dashboard', icon: Brain },
		],
	},
	{
		title: 'Social & Community',
		items: [
			{ href: '/channels', label: 'Study Channels', icon: Users },
			{ href: '/study-buddies', label: 'Study Buddies', icon: UserPlus },
			{ href: '/comments', label: 'Comments', icon: MessageCircle },
			{ href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
			{ href: '/achievements', label: 'Achievements', icon: Award },
		],
	},
	{
		title: 'Account & Settings',
		items: [
			{ href: '/profile', label: 'My Profile', icon: UserIcon },
			{ href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
			{ href: '/notifications', label: 'Notifications', icon: Bell },
			{ href: '/calendar', label: 'Calendar', icon: CalendarDays },
			{ href: '/language', label: 'Language', icon: Globe },
			{ href: '/2fa', label: 'Two-Factor Auth', icon: Key },
			{ href: '/settings', label: 'Settings', icon: Settings },
			{ href: '/onboarding', label: 'Test Onboarding', icon: Sparkles },
		],
	},
	{
		title: 'Admin',
		items: [
			{ href: '/admin', label: 'Admin Panel', icon: Shield },
			{ href: '/admin/moderation', label: 'Admin Moderation', icon: ShieldAlert },
			{ href: '/cms', label: 'Content Management', icon: Layout },
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
					<SearchIcon className="absolute left-5 w-4 h-4 text-sidebar-foreground/40" />
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
						<SearchIcon className="w-8 h-8 mb-2" />
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
											<ChevronDown className="w-4 h-4" />
										) : (
											<ChevronRight className="w-4 h-4" />
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
																<item.icon className="w-4 h-4" />
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
					<Sun className="w-4 h-4 text-yellow-500" />
				) : (
					<Moon className="w-4 h-4 text-sidebar-foreground/70" />
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
			<LogOut className="w-4 h-4" />
			<span>Logout</span>
		</Button>
	);
}
