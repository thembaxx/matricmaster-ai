'use client';

import {
	AiBrain01Icon,
	AlertCircleIcon,
	ArrowRight01Icon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Calendar01Icon,
	Cancel01Icon,
	ChampionIcon,
	Chat01Icon,
	ComputerVideoCallIcon,
	ContentWritingIcon,
	File01Icon,
	GlobeIcon,
	GridIcon,
	Home01Icon,
	Key01Icon,
	Layers01Icon,
	LayoutLeftIcon,
	Logout01Icon,
	MapsIcon,
	Medal01Icon,
	Mic01Icon,
	Mortarboard02Icon,
	Notification03Icon,
	QuestionIcon,
	Search01Icon,
	Settings01Icon,
	Shield01Icon,
	SparklesIcon,
	Timer01Icon,
	UserAdd01Icon,
	UserGroupIcon,
	User as UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { m } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { appConfig } from '@/app.config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

type IconSvg = typeof Home01Icon;

type MobileNavItem = {
	href: string;
	label: string;
	icon?: IconSvg;
	fluentEmoji?: string;
};

type MobileNavSection = {
	title: string;
	items: MobileNavItem[];
};

const MOBILE_NAV_SECTIONS: MobileNavSection[] = [
	{
		title: 'Learning',
		items: [
			{ href: '/dashboard', label: 'Dashboard', icon: Home01Icon },
			{ href: '/lessons', label: 'Lessons', icon: BookOpen01Icon },
			{ href: '/physics', label: 'Physics', fluentEmoji: '⚛️' },
			{ href: '/search', label: 'Search', icon: Search01Icon },
			{ href: '/study-companion', label: 'Study Companion', icon: SparklesIcon },
			{ href: '/study-path', label: 'Study Path', icon: MapsIcon },
			{ href: '/study-plan', label: 'Study Plan', icon: Calendar01Icon },
			{ href: '/curriculum-map', label: 'Curriculum Map', icon: GridIcon },
			{ href: '/periodic-table', label: 'Periodic Table', fluentEmoji: '⚛️' },
			{ href: '/tutoring', label: 'AI Tutoring', icon: ComputerVideoCallIcon },
			{ href: '/voice-tutor', label: 'Voice Tutor', icon: Mic01Icon },
			{ href: '/essay-grader', label: 'Essay Grader', icon: ContentWritingIcon },
			{ href: '/aps-calculator', label: 'APS Calculator', icon: CalculatorIcon },
			{ href: '/exam-timer', label: 'Exam Timer', icon: Timer01Icon },
		],
	},
	{
		title: 'Practice',
		items: [
			{ href: '/quiz', label: 'Quiz', icon: QuestionIcon },
			{ href: '/flashcards', label: 'Flashcards', icon: Layers01Icon },
			{ href: '/past-papers', label: 'Past Papers', icon: File01Icon },
			{ href: '/snap-and-solve', label: 'Snap & Solve', icon: CalculatorIcon },
			{ href: '/common-questions', label: 'Common Questions', icon: QuestionIcon },
			{ href: '/review', label: 'Review', icon: AiBrain01Icon },
		],
	},
	{
		title: 'Results & Planning',
		items: [
			{ href: '/results', label: 'NSC Results', icon: Mortarboard02Icon },
			{ href: '/school', label: 'University Applications', icon: BookOpen01Icon },
			{ href: '/subscription', label: 'Subscription', icon: SparklesIcon },
			{ href: '/analytics', label: 'Analytics', icon: CalculatorIcon },
		],
	},
	{
		title: 'Focus',
		items: [
			{ href: '/focus', label: 'Focus Mode', icon: Timer01Icon },
			{ href: '/focus-rooms', label: 'Focus Rooms', icon: UserGroupIcon },
			{ href: '/offline', label: 'Offline Mode', icon: File01Icon },
		],
	},
	{
		title: 'Social',
		items: [
			{ href: '/achievements', label: 'Achievements', icon: Medal01Icon },
			{ href: '/channels', label: 'Study Channels', icon: UserGroupIcon },
			{ href: '/comments', label: 'Comments', icon: Chat01Icon },
			{ href: '/leaderboard', label: 'Leaderboard', icon: ChampionIcon },
			{ href: '/study-buddies', label: 'Study Buddies', icon: UserAdd01Icon },
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

export function MobileNavDrawer({
	children,
	user,
}: {
	children: React.ReactNode;
	user: { name?: string | null; email?: string | null; image?: string | null } | null | undefined;
}) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	const filteredSections = useMemo(() => {
		if (!searchQuery.trim()) return MOBILE_NAV_SECTIONS;
		const query = searchQuery.toLowerCase();
		return MOBILE_NAV_SECTIONS.map((section) => ({
			...section,
			items: section.items.filter((item) => item.label.toLowerCase().includes(query)),
		})).filter((section) => section.items.length > 0);
	}, [searchQuery]);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push('/sign-in');
		setOpen(false);
	};

	const handleNavigation = (href: string) => {
		setOpen(false);
		setSearchQuery('');
		router.push(href);
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
				</DrawerHeader>
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-col"
					style={{ maxHeight: '85vh' }}
				>
					<div className="px-4 pb-4 border-b border-sidebar-border/50">
						<div className="flex items-center justify-between mb-3">
							{user ? (
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleNavigation('/profile')}
									className="flex items-center gap-3 p-1.5 -ml-1.5 w-full h-auto rounded-lg hover:bg-sidebar-accent transition-colors text-left"
								>
									<Avatar className="h-9 w-9">
										<AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
										<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
											{user.name?.charAt(0)?.toUpperCase() || 'U'}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sidebar-foreground text-sm truncate">
											{user.name}
										</p>
										<p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
									</div>
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="w-4 h-4 text-sidebar-foreground/40"
									/>
								</Button>
							) : (
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleNavigation('/dashboard')}
									className="flex items-center gap-3 h-auto"
								>
									<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sidebar-primary to-purple-400 flex items-center justify-center">
										<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 text-white" />
									</div>
									<h1 className="text-base font-semibold text-sidebar-foreground">
										{appConfig.name}
									</h1>
								</Button>
							)}
							<Button
								variant="ghost"
								size="icon"
								className="rounded-lg h-9 w-9 -mr-1"
								onClick={() => setOpen(false)}
							>
								<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
							</Button>
						</div>

						<div className="relative">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50"
							/>
							<Input
								type="text"
								placeholder="Search pages..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 bg-sidebar-accent/40 border-transparent rounded-lg h-10 text-sm"
							/>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto px-3 py-3">
						{filteredSections.map((section) => (
							<div key={section.title} className="mb-4">
								<p className="px-2 mb-1.5 text-[10px] font-medium tracking-wider text-sidebar-foreground/40 uppercase">
									{section.title}
								</p>
								<div className="space-y-0.5">
									{section.items.map((item) => (
										<MobileNavLink key={item.href} item={item} onNavigate={handleNavigation} />
									))}
								</div>
							</div>
						))}
						{filteredSections.length === 0 && (
							<div className="text-center py-6 text-sidebar-foreground/50">
								<p className="text-sm">No results found</p>
							</div>
						)}
					</div>

					<div className="px-3 py-3 border-t border-sidebar-border/50">
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg h-11"
							onClick={handleSignOut}
						>
							<HugeiconsIcon icon={Logout01Icon} className="w-5 h-5" />
							<span className="text-sm">Sign Out</span>
						</Button>
					</div>
				</m.div>
			</DrawerContent>
		</Drawer>
	);
}

function MobileNavLink({
	item,
	onNavigate,
}: {
	item: MobileNavItem;
	onNavigate: (href: string) => void;
}) {
	const pathname = usePathname();
	const isActive = pathname === item.href;

	return (
		<Button
			type="button"
			variant="ghost"
			onClick={() => onNavigate(item.href)}
			className={cn(
				'w-full flex items-center gap-3 px-3 h-11 rounded-lg text-left',
				isActive
					? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
					: 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
			)}
		>
			{item.fluentEmoji ? (
				<FluentEmoji emoji={item.fluentEmoji} size={20} className="w-5 h-5" />
			) : item.icon ? (
				<HugeiconsIcon icon={item.icon} className="w-5 h-5" />
			) : null}
			<span className="text-sm">{item.label}</span>
		</Button>
	);
}

export function MobileMenuButton() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	return (
		<MobileNavDrawer user={user}>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-tiimo hover:bg-card active:scale-95"
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
			</Button>
		</MobileNavDrawer>
	);
}
