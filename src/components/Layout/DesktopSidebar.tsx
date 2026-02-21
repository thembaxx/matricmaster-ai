'use client';

import {
	Award,
	Bell,
	Bookmark,
	BookOpen,
	Brain,
	Calendar,
	FileText,
	Globe,
	Home,
	Layout,
	LogOut,
	Map as MapIcon,
	Moon,
	Search as SearchIcon,
	Settings,
	Shield,
	Sparkles,
	Sun,
	Trophy,
	User as UserIcon,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { ProfileMenu } from './profile-menu';

type AuthUser = typeof authClient.$Infer.Session.user;

export const sideMenuItems = [
	{ href: '/dashboard', label: 'Dashboard', icon: Home },
	{ href: '/search', label: 'Search', icon: SearchIcon },
	{ href: '/lessons', label: 'Lessons', icon: BookOpen },
	{ href: '/past-papers', label: 'Past Papers', icon: FileText },
	{ href: '/review', label: 'Review Dashboard', icon: Brain },
	{ href: '/flashcards', label: 'Flashcards', icon: BookOpen },
	{ href: '/test', label: 'Physics Test', icon: Sparkles },
	{ href: '/ai-tutor', label: 'AI Tutor', icon: Sparkles },
	{ href: '/study-path', label: 'Study Path', icon: MapIcon },
	{ href: '/study-plan', label: 'Study Plan', icon: Calendar },
	{ href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
	{ href: '/achievements', label: 'Achievements', icon: Award },
	{ href: '/channels', label: 'Study Channels', icon: Users },
	{ href: '/study-buddies', label: 'Study Buddies', icon: Users },
	{ href: '/notifications', label: 'Notifications', icon: Bell },
	{ href: '/bookmarks', label: 'My Saved Items', icon: Bookmark },
	{ href: '/profile', label: 'My Profile', icon: UserIcon },
	{ href: '/language', label: 'Language', icon: Globe },
	{ href: '/settings', label: 'Settings', icon: Settings },
	{ href: '/admin', label: 'Admin Panel', icon: Shield },
	{ href: '/cms', label: 'Content Management', icon: Layout },
];

type DesktopSidebarProps = {
	user: AuthUser;
	pathname: string;
	theme: string;
	onToggleTheme: () => void;
};

export function DesktopSidebar({ user, pathname, theme, onToggleTheme }: DesktopSidebarProps) {
	return (
		<aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300">
			<div className="p-8 pb-4">
				<Link href="/dashboard" className="block mb-8">
					<h1 className="text-xl font-black text-foreground uppercase tracking-tighter">
						MatricMaster
					</h1>
					<p className="text-muted-foreground font-bold text-[10px] uppercase tracking-wide">
						Level up your learning
					</p>
				</Link>

				<nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar pr-2">
					{sideMenuItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${
									isActive
										? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground'
								}`}
							>
								<item.icon
									className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`}
								/>
								<span className="font-bold text-sm">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="mt-auto p-8 border-t border-border space-y-6">
				<ThemeToggle theme={theme} onToggle={onToggleTheme} />
				<UserProfileButton user={user} />
				<LogoutButton />
			</div>
		</aside>
	);
}

type ThemeToggleProps = {
	theme: string;
	onToggle: () => void;
};

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
	return (
		<div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
			<span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
				Theme
			</span>
			<Button
				variant="ghost"
				size="sm"
				className="rounded-xl bg-card shadow-sm h-8 w-8 p-0"
				onClick={onToggle}
				aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
			>
				{theme === 'dark' ? (
					<Sun className="w-4 h-4 text-yellow-500" />
				) : (
					<Moon className="w-4 h-4 text-muted-foreground" />
				)}
			</Button>
		</div>
	);
}

type UserProfileButtonProps = {
	user: AuthUser;
};

function UserProfileButton({ user }: UserProfileButtonProps) {
	return (
		<ProfileMenu user={user}>
			<button
				type="button"
				className="flex items-center gap-3 w-full p-2 rounded-2xl hover:bg-muted transition-all"
			>
				<Avatar className="h-10 w-10 border-2 border-background shadow-sm">
					<AvatarImage src={user.image || undefined} alt={user.name} />
					<AvatarFallback className="bg-primary text-primary-foreground">
						{user.name?.charAt(0)}
					</AvatarFallback>
				</Avatar>
				<div className="text-left overflow-hidden">
					<p className="font-black text-sm text-foreground truncate">{user.name}</p>
					<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter truncate">
						View Profile
					</p>
				</div>
			</button>
		</ProfileMenu>
	);
}

async function handleLogout() {
	await authClient.signOut();
	window.location.href = '/sign-in';
}

function LogoutButton() {
	return (
		<Button
			variant="ghost"
			className="w-full justify-start gap-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl p-4 h-auto font-bold transition-all"
			onClick={handleLogout}
		>
			<LogOut className="w-5 h-5" />
			Logout
		</Button>
	);
}
