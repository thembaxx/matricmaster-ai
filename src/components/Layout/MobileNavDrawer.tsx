'use client';

import {
	AiBrain01Icon,
	AlertCircleIcon,
	ArrowRight01Icon,
	AtomIcon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Calendar01Icon,
	Cancel01Icon,
	ChampionIcon,
	Chat01Icon,
	File01Icon,
	GameController01Icon,
	GlobeIcon,
	GridIcon,
	Home01Icon,
	Key01Icon,
	Layers01Icon,
	LayoutLeftIcon,
	Logout01Icon,
	MapsIcon,
	Medal01Icon,
	Notification03Icon,
	QuestionIcon,
	Search01Icon,
	Settings01Icon,
	Shield01Icon,
	SparklesIcon,
	Task01Icon,
	Timer01Icon,
	UserAdd01Icon,
	UserGroupIcon,
	User as UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
	icon: IconSvg;
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
			{ href: '/interactive-quiz', label: 'Interactive Quiz', icon: GameController01Icon },
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
					<div className="px-6 pb-4 border-b border-sidebar-border/50">
						<div className="flex items-center justify-between mb-4">
							{user ? (
								<button
									type="button"
									onClick={() => handleNavigation('/profile')}
									className="flex items-center gap-3 p-2 -m-2 w-full rounded-xl hover:bg-sidebar-accent transition-colors text-left"
								>
									<Avatar className="h-11 w-11 border-2 border-sidebar-primary/30">
										<AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
										<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold">
											{user.name?.charAt(0)?.toUpperCase() || 'U'}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sidebar-foreground truncate">{user.name}</p>
										<p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
									</div>
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="w-4 h-4 text-sidebar-foreground/30"
									/>
								</button>
							) : (
								<button
									type="button"
									onClick={() => handleNavigation('/dashboard')}
									className="flex items-center gap-3"
								>
									<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sidebar-primary to-purple-400 flex items-center justify-center shadow-lg">
										<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5 text-white" />
									</div>
									<h1 className="text-lg font-semibold text-sidebar-foreground">
										{appConfig.name}
									</h1>
								</button>
							)}
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full"
								onClick={() => setOpen(false)}
							>
								<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
							</Button>
						</div>

						<div className="relative">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/40"
							/>
							<Input
								type="text"
								placeholder="Search pages..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-sidebar-accent/50 border-sidebar-border/50 rounded-xl h-11"
							/>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto px-4 py-4">
						{filteredSections.map((section) => (
							<div key={section.title} className="mb-5">
								<p className="px-3 mb-2 text-[10px] font-medium text-sidebar-foreground/40">
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
							<div className="text-center py-8 text-sidebar-foreground/40">
								<p className="text-sm">No results found</p>
							</div>
						)}
					</div>

					<div className="px-4 py-4 border-t border-sidebar-border/50 bg-sidebar-accent/10">
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl h-12 font-medium"
							onClick={handleSignOut}
						>
							<HugeiconsIcon icon={Logout01Icon} className="w-5 h-5" />
							<span>Sign Out</span>
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
		<button
			type="button"
			onClick={() => onNavigate(item.href)}
			className={cn(
				'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left',
				isActive
					? 'bg-sidebar-primary/10 text-sidebar-primary'
					: 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
			)}
		>
			<HugeiconsIcon icon={item.icon} className="w-5 h-5" />
			<span className="font-medium">{item.label}</span>
			{isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
		</button>
	);
}

export function MobileMenuButton() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	return (
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
	);
}
