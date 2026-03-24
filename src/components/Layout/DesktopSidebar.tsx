'use client';

import {
	AiBrain01Icon,
	AlertCircleIcon,
	ArrowDown01Icon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Calendar01Icon,
	ChampionIcon,
	Chat01Icon,
	ComputerVideoCallIcon,
	ContentWritingIcon,
	File01Icon,
	GlobeIcon,
	GridIcon,
	Home01Icon,
	Key01Icon,
	LaptopSettingsIcon,
	Layers01Icon,
	LayoutLeftIcon,
	MapsIcon,
	Medal01Icon,
	Mic01Icon,
	MoonIcon,
	Mortarboard02Icon,
	Notification03Icon,
	QuestionIcon,
	Search01Icon,
	Settings01Icon,
	Shield01Icon,
	SparklesIcon,
	Sun01Icon,
	Timer01Icon,
	UserGroupIcon,
	User as UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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
import type { Theme } from '@/stores/useThemeStore';
import { ProfileMenu } from './profile-menu';

type AuthUser = typeof authClient.$Infer.Session.user;

type IconSvg = typeof Home01Icon;

type MenuItem = {
	href: string;
	label: string;
	icon?: IconSvg;
	fluentEmoji?: string;
};

type MenuSection = {
	title: string;
	items: MenuItem[];
};

export const sideMenuSections: MenuSection[] = [
	{
		title: 'learning',
		items: [
			{ href: '/dashboard', label: 'dashboard', icon: Home01Icon },
			{ href: '/demo', label: 'demo', icon: SparklesIcon },
			{ href: '/lessons', label: 'lessons', icon: BookOpen01Icon },
			{ href: '/physics', label: 'physics', fluentEmoji: '⚛️' },
			{ href: '/search', label: 'search', icon: Search01Icon },
			{ href: '/study-companion', label: 'study companion', icon: SparklesIcon },
			{ href: '/study-path', label: 'study path', icon: MapsIcon },
			{ href: '/study-plan', label: 'study plan', icon: Calendar01Icon },
			{ href: '/curriculum-map', label: 'curriculum map', icon: GridIcon },
			{ href: '/periodic-table', label: 'periodic table', fluentEmoji: '⚛️' },
			{ href: '/chat', label: 'study buddy', icon: Chat01Icon },
			{ href: '/smart-scheduler', label: 'study planner', icon: Calendar01Icon },
			{ href: '/tutoring', label: 'matric tutor', icon: ComputerVideoCallIcon },
			{ href: '/voice-tutor', label: 'voice tutor', icon: Mic01Icon },
			{ href: '/essay-grader', label: 'essay grader', icon: ContentWritingIcon },
			{ href: '/aps-calculator', label: 'aps calculator', icon: CalculatorIcon },
			{ href: '/exam-timer', label: 'exam timer', icon: Timer01Icon },
		],
	},
	{
		title: 'practice',
		items: [
			{ href: '/quiz', label: 'quiz', icon: QuestionIcon },
			{ href: '/flashcards', label: 'flashcards', icon: Layers01Icon },
			{ href: '/past-papers', label: 'past papers', icon: File01Icon },
			{ href: '/snap-and-solve', label: 'snap & solve', icon: CalculatorIcon },
			{ href: '/common-questions', label: 'common questions', icon: QuestionIcon },
			{ href: '/review', label: 'review', icon: AiBrain01Icon },
		],
	},
	{
		title: 'results & planning',
		items: [
			{ href: '/results', label: 'nsc results', icon: Mortarboard02Icon },
			{ href: '/school', label: 'university applications', icon: BookOpen01Icon },
			{ href: '/subscription', label: 'subscription', icon: SparklesIcon },
			{ href: '/analytics', label: 'analytics', icon: CalculatorIcon },
		],
	},
	{
		title: 'focus',
		items: [
			{ href: '/focus', label: 'focus mode', icon: Timer01Icon },
			{ href: '/focus-rooms', label: 'focus rooms', icon: UserGroupIcon },
			{ href: '/offline', label: 'offline mode', icon: File01Icon },
		],
	},
	{
		title: 'social',
		items: [
			{ href: '/achievements', label: 'achievements', icon: Medal01Icon },
			{ href: '/channels', label: 'study channels', icon: UserGroupIcon },
			{ href: '/comments', label: 'comments', icon: Chat01Icon },
			{ href: '/leaderboard', label: 'leaderboard', icon: ChampionIcon },
			{ href: '/study-buddies', label: 'study buddies', icon: UserGroupIcon },
		],
	},
	{
		title: 'account',
		items: [
			{ href: '/2fa', label: 'two-factor auth', icon: Key01Icon },
			{ href: '/bookmarks', label: 'bookmarks', icon: BookmarkIcon },
			{ href: '/calendar', label: 'calendar', icon: Calendar01Icon },
			{ href: '/language', label: 'language', icon: GlobeIcon },
			{ href: '/notifications', label: 'notifications', icon: Notification03Icon },
			{ href: '/parent-dashboard', label: 'parent portal', icon: UserGroupIcon },
			{ href: '/profile', label: 'profile', icon: UserIcon },
			{ href: '/settings', label: 'settings', icon: Settings01Icon },
		],
	},
	{
		title: 'admin',
		items: [
			{ href: '/admin', label: 'admin panel', icon: Shield01Icon },
			{ href: '/admin/moderation', label: 'moderation', icon: AlertCircleIcon },
			{ href: '/cms', label: 'content management', icon: LayoutLeftIcon },
		],
	},
];

export const sideMenuItems = sideMenuSections.flatMap((section) => section.items);

type AppSidebarProps = {
	user: AuthUser;
	pathname: string;
	theme: string;
	onSetTheme: (theme: Theme) => void;
};

export function AppSidebar({ user, pathname, theme, onSetTheme }: AppSidebarProps) {
	const { setOpenMobile } = useSidebar();
	const [searchQuery, setSearchQuery] = useState('');
	const [openSection, setOpenSection] = useState<string | null>('learning');

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

	const hasOpenSection = filteredSections.some((s) => s.title === openSection);
	const shouldAutoOpen = searchQuery.trim() && filteredSections.length > 0 && !hasOpenSection;
	const initialSection = filteredSections[0]?.title ?? openSection;

	const computedOpenSection = shouldAutoOpen ? initialSection : openSection;

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
						className="absolute left-5 w-4 h-4 text-sidebar-foreground/50"
					/>
					<Input
						placeholder="search..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-9 dark:bg-sidebar-accent/60 placeholder:text-sidebar-foreground/40 border-sidebar-border/50 focus-visible:ring-sidebar-ring rounded-lg shadow-none text-sm"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-3">
				{filteredSections.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-sidebar-foreground/40">
						<HugeiconsIcon icon={Search01Icon} className="w-8 h-8 mb-2" />
						<p className="text-sm">no results found</p>
					</div>
				) : (
					filteredSections.map((section) => (
						<SidebarGroup key={section.title} className="py-1">
							<button
								type="button"
								onClick={() => handleSectionToggle(section.title)}
								className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
							>
								<span className="text-[9px] font-medium tracking-wider text-sidebar-foreground/35 grow truncate text-left">
									{section.title}
								</span>
								<HugeiconsIcon
									icon={ArrowDown01Icon}
									className={cn(
										'w-3 h-3 transition-transform duration-200',
										computedOpenSection === section.title
											? 'rotate-180 text-sidebar-foreground/70'
											: 'text-sidebar-foreground/30'
									)}
								/>
							</button>
							<div
								className={cn(
									'overflow-hidden transition-all duration-200',
									computedOpenSection === section.title
										? 'max-h-[1000px] opacity-100'
										: 'max-h-0 opacity-0'
								)}
							>
								<SidebarMenu className="pt-1 pr-0!">
									{section.items.map((item) => {
										const isActive = pathname === item.href;
										return (
											<SidebarMenuItem key={item.href}>
												<SidebarMenuButton
													asChild
													isActive={isActive}
													className={cn(
														'pl-3 rounded-xl h-10 transition-colors',
														isActive
															? 'bg-sidebar-primary/10 text-sidebar-primary'
															: 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
													)}
												>
													<Link
														href={item.href}
														transitionTypes={['fade']}
														onClick={handleLinkClick}
														className="flex items-center gap-3"
													>
														{item.fluentEmoji ? (
															<FluentEmoji
																type="3d"
																emoji={item.fluentEmoji}
																size={20}
																className={cn(
																	'w-5 h-5',
																	isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
																)}
															/>
														) : item.icon ? (
															<HugeiconsIcon
																icon={item.icon}
																className={cn(
																	'w-5 h-5',
																	isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
																)}
															/>
														) : null}
														<span className="font-medium text-[13px] grow truncate">
															{item.label}
														</span>
														{isActive && (
															<div className="ml-auto mr-3.5 w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
														)}
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</div>
						</SidebarGroup>
					))
				)}
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border/50 p-3 space-y-2">
				<ThemeToggle theme={theme} onSetTheme={onSetTheme} />
				<SidebarSeparator className="bg-sidebar-border/50" />
				<UserProfileSection user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}

type ThemeToggleProps = {
	theme: string;
	onSetTheme: (theme: Theme) => void;
};

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun01Icon; color: string }[] = [
	{ value: 'system', label: 'system', icon: LaptopSettingsIcon, color: 'text-violet-500' },
	{ value: 'light', label: 'light', icon: Sun01Icon, color: 'text-amber-500' },
	{ value: 'dark', label: 'dark', icon: MoonIcon, color: 'text-blue-400' },
];

function ThemeToggle({ theme, onSetTheme }: ThemeToggleProps) {
	const currentIndex = THEME_OPTIONS.findIndex((opt) => opt.value === theme);
	const current = THEME_OPTIONS[currentIndex >= 0 ? currentIndex : 0];

	const handleCycle = () => {
		const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
		onSetTheme(THEME_OPTIONS[nextIndex].value);
	};

	return (
		<Button
			type="button"
			variant="ghost"
			onClick={handleCycle}
			className="w-full flex items-center justify-between px-4 py-2.5 h-auto rounded-xl bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors group focus-visible:ring-2 focus-visible:ring-primary"
		>
			<span className="text-xs font-medium text-sidebar-foreground/70">{current.label}</span>
			<div className="w-7 h-7 rounded-lg bg-sidebar flex items-center justify-center shadow-sm">
				<HugeiconsIcon icon={current.icon} className={cn('w-4 h-4', current.color)} />
			</div>
		</Button>
	);
}

type UserProfileSectionProps = {
	user: AuthUser;
};

function UserProfileSection({ user }: UserProfileSectionProps) {
	return (
		<ProfileMenu user={user}>
			<Button
				type="button"
				variant="ghost"
				className="w-full flex items-center gap-3 p-2 h-auto rounded-xl hover:bg-sidebar-accent transition-colors text-left focus-visible:ring-2 focus-visible:ring-primary"
			>
				<Avatar className="h-10 w-10 border-2 border-sidebar-primary/30 shadow-sm">
					<AvatarImage src={user.image || undefined} alt={user.name} />
					<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
						{user.name?.charAt(0)?.toLowerCase() || 'u'}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
					<p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
				</div>
			</Button>
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
			className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-primary"
			onClick={handleLogout}
		>
			<HugeiconsIcon icon={Settings01Icon} className="w-4 h-4" />
			<span>logout</span>
		</Button>
	);
}
