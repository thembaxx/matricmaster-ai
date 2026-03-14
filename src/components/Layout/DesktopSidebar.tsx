'use client';

import {
	AiBrain01Icon,
	AlertCircleIcon,
	ArrowDown01Icon,
	AtomIcon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Calendar01Icon,
	ChampionIcon,
	Chat01Icon,
	File01Icon,
	GlobeIcon,
	GridIcon,
	Home01Icon,
	Key01Icon,
	Layers01Icon,
	LayoutLeftIcon,
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
	Timer01Icon,
	UserGroupIcon,
	User as UserIcon,
	WorkoutSportIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { appConfig } from '@/app.config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	useSidebar,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { ProfileMenu } from './profile-menu';

type AuthUser = typeof authClient.$Infer.Session.user;

type IconSvg = typeof Home01Icon;

type MenuItem = {
	href: string;
	label: string;
	icon: IconSvg;
};

type MenuSection = {
	title: string;
	items: MenuItem[];
};

export const sideMenuSections: MenuSection[] = [
	{
		title: 'Learning',
		items: [
			{ href: '/dashboard', label: 'Dashboard', icon: Home01Icon },
			{ href: '/lessons', label: 'Lessons', icon: BookOpen01Icon },
			{ href: '/physics', label: 'Physics', icon: AtomIcon },
			{ href: '/search', label: 'Search', icon: Search01Icon },
			{ href: '/study-companion', label: 'Study Companion', icon: SparklesIcon },
			{ href: '/study-path', label: 'Study Path', icon: MapsIcon },
			{ href: '/study-plan', label: 'Study Plan', icon: Calendar01Icon },
			{ href: '/curriculum-map', label: 'Curriculum Map', icon: GridIcon },
			{ href: '/periodic-table', label: 'Periodic Table', icon: AtomIcon },
		],
	},
	{
		title: 'Practice',
		items: [
			{ href: '/common-questions', label: 'Common Questions', icon: QuestionIcon },
			{ href: '/flashcards', label: 'Flashcards', icon: Layers01Icon },
			{ href: '/interactive-quiz', label: 'Interactive Quiz', icon: WorkoutSportIcon },
			{ href: '/math-quiz', label: 'Math Quiz', icon: CalculatorIcon },
			{ href: '/past-papers', label: 'Past Papers', icon: File01Icon },
			{ href: '/physics-quiz', label: 'Physics Quiz', icon: AtomIcon },
			{ href: '/practice-quiz', label: 'Practice Quiz', icon: Task01Icon },
			{ href: '/quiz', label: 'Quiz', icon: QuestionIcon },
			{ href: '/review', label: 'Review', icon: AiBrain01Icon },
		],
	},
	{
		title: 'Focus',
		items: [
			{ href: '/focus', label: 'Focus Mode', icon: Timer01Icon },
			{ href: '/focus-rooms', label: 'Focus Rooms', icon: UserGroupIcon },
		],
	},
	{
		title: 'Social',
		items: [
			{ href: '/achievements', label: 'Achievements', icon: Medal01Icon },
			{ href: '/channels', label: 'Study Channels', icon: UserGroupIcon },
			{ href: '/comments', label: 'Comments', icon: Chat01Icon },
			{ href: '/leaderboard', label: 'Leaderboard', icon: ChampionIcon },
			{ href: '/study-buddies', label: 'Study Buddies', icon: UserGroupIcon },
		],
	},
	{
		title: 'Account',
		items: [
			{ href: '/2fa', label: 'Two-Factor Auth', icon: Key01Icon },
			{ href: '/bookmarks', label: 'Bookmarks', icon: BookmarkIcon },
			{ href: '/calendar', label: 'Calendar', icon: Calendar01Icon },
			{ href: '/language', label: 'Language', icon: GlobeIcon },
			{ href: '/notifications', label: 'Notifications', icon: Notification03Icon },
			{ href: '/parent-dashboard', label: 'Parent Portal', icon: UserGroupIcon },
			{ href: '/profile', label: 'Profile', icon: UserIcon },
			{ href: '/settings', label: 'Settings', icon: Settings01Icon },
		],
	},
	{
		title: 'Admin',
		items: [
			{ href: '/admin', label: 'Admin Panel', icon: Shield01Icon },
			{ href: '/admin/moderation', label: 'Moderation', icon: AlertCircleIcon },
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
	const [openSection, setOpenSection] = useState<string | null>('Learning');

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
			<SidebarHeader className="border-b-0 px-4 pt-4 pb-2">
				<div className="relative flex items-center px-2 mt-2">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-5 w-4 h-4 text-sidebar-foreground/30"
					/>
					<Input
						placeholder="Search..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-10 bg-sidebar-accent/40 placeholder:text-xs placeholder:text-sidebar-foreground/40 border-sidebar-border/50 focus-visible:ring-sidebar-ring rounded-lg shadow-none bg-white text-sm"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-3">
				{filteredSections.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-sidebar-foreground/40">
						<HugeiconsIcon icon={Search01Icon} className="w-8 h-8 mb-2" />
						<p className="text-sm">No results found</p>
					</div>
				) : (
					filteredSections.map((section) => (
						<SidebarGroup key={section.title} className="py-1">
							<m.button
								type="button"
								onClick={() => handleSectionToggle(section.title)}
								className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group"
							>
								<span className="text-[10px] font-medium text-sidebar-foreground/50 grow truncate text-left">
									{section.title}
								</span>
								<m.div
									animate={{ rotate: openSection === section.title ? 180 : 0 }}
									transition={{ duration: 0.2 }}
								>
									<HugeiconsIcon
										icon={ArrowDown01Icon}
										className="w-3 h-3 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/70"
									/>
								</m.div>
							</m.button>
							<m.div
								initial={false}
								animate={{
									height: openSection === section.title ? 'auto' : 0,
									opacity: openSection === section.title ? 1 : 0,
								}}
								transition={{ duration: 0.2 }}
								className="overflow-hidden"
							>
								<SidebarMenu className="pt-1 pr-0!">
									{section.items.map((item, idx) => {
										const isActive = pathname === item.href;
										return (
											<SidebarMenuItem key={item.href}>
												<SidebarMenuButton
													asChild
													isActive={isActive}
													className={cn(
														'pl-3.5 rounded-xl h-11 transition-all duration-200',
														isActive
															? 'bg-sidebar-primary/10 text-sidebar-primary shadow-sm'
															: 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
													)}
												>
													<Link
														href={item.href}
														onClick={handleLinkClick}
														className="flex items-center gap-3"
													>
														<m.div
															initial={{ opacity: 0, x: -10 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{ delay: idx * 0.02 }}
														>
															<HugeiconsIcon
																icon={item.icon}
																className={cn(
																	'w-[18px] h-[18px]',
																	isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'
																)}
															/>
														</m.div>
														<span className="font-medium text-[13px] grow truncate">{item.label}</span>
														{isActive && (
															<m.div
																layoutId="sidebar-active"
																className="ml-auto mr-3.5 w-1.5 h-1.5 rounded-full bg-sidebar-primary"
															/>
														)}
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</m.div>
						</SidebarGroup>
					))
				)}
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border/50 p-3 space-y-2">
				<ThemeToggle theme={theme} onToggle={onToggleTheme} />
				<SidebarSeparator className="bg-sidebar-border/50" />
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
		<button
			type="button"
			onClick={onToggle}
			className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors group"
		>
			<span className="text-xs font-medium text-sidebar-foreground/60">Appearance</span>
			<m.div
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.95 }}
				className="w-7 h-7 rounded-lg bg-sidebar flex items-center justify-center shadow-sm"
			>
				{theme === 'dark' ? (
					<HugeiconsIcon icon={Sun01Icon} className="w-3.5 h-3.5 text-amber-500" />
				) : (
					<HugeiconsIcon icon={MoonIcon} className="w-3.5 h-3.5 text-sidebar-foreground/60" />
				)}
			</m.div>
		</button>
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
				className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors text-left"
			>
				<Avatar className="h-10 w-10 border-2 border-sidebar-primary/30 shadow-sm">
					<AvatarImage src={user.image || undefined} alt={user.name} />
					<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
						{user.name?.charAt(0)?.toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
					<p className="text-[10px] text-sidebar-foreground/40 truncate">{user.email}</p>
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
			className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
			onClick={handleLogout}
		>
			<HugeiconsIcon icon={Settings01Icon} className="w-4 h-4" />
			<span>Logout</span>
		</Button>
	);
}
