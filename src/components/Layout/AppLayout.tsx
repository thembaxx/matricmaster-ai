'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
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
	Menu,
	Moon,
	Search as SearchIcon,
	Settings,
	Shield,
	Sparkles,
	Sun,
	Trophy,
	User,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClientOnly } from '@/components/ClientOnly';
import { DailyLoginBonus } from '@/components/Gamification/DailyLoginBonus';
import { useNotificationContextSafe } from '@/components/Notifications/NotificationListener';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import PageTransition from '../Transition/PageTransition';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ProfileMenu } from './profile-menu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const { unreadCount } = useNotificationContextSafe();

	const [sheetOpen, setSheetOpen] = useState(false);

	const hideNavigation: string[] = ['/test'];
	const hideBottomNavigation = ['/sign-in', '/sign-up', '/test'];

	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));
	const shouldHideBottomNav = hideBottomNavigation.some((path) => pathname.startsWith(path));

	const navItems = [
		{ href: '/dashboard', label: 'Home', icon: 'fluent:clover-24-filled' },
		{ href: '/search', label: 'Search', icon: 'fluent:search-sparkle-24-filled' },
		{ href: '/review', label: 'Review', icon: 'fluent:brain-sparkle-24-filled' },
		{ href: '/past-papers', label: 'Papers', icon: 'fluent:hat-graduation-sparkle-24-filled' },
		{ href: '/bookmarks', label: 'Saved', icon: 'fluent:bookmark-24-filled' },
	];

	const sideMenuItems = [
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
		{ href: '/profile', label: 'My Profile', icon: User },
		{ href: '/language', label: 'Language', icon: Globe },
		{ href: '/settings', label: 'Settings', icon: Settings },
		{ href: '/admin', label: 'Admin Panel', icon: Shield },
		{ href: '/cms', label: 'Content Management', icon: Layout },
	];

	return (
		<div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
			<ClientOnly>{user && <DailyLoginBonus />}</ClientOnly>

			{/* Desktop Sidebar */}
			{user && !shouldHideNav && (
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
						<div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
							<span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
								Theme
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="rounded-xl bg-card shadow-sm h-8 w-8 p-0"
								onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
							>
								{theme === 'dark' ? (
									<Sun className="w-4 h-4 text-yellow-500" />
								) : (
									<Moon className="w-4 h-4 text-muted-foreground" />
								)}
							</Button>
						</div>

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

						<Button
							variant="ghost"
							className="w-full justify-start gap-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl p-4 h-auto font-bold transition-all"
							onClick={async () => {
								await authClient.signOut();
								window.location.href = '/sign-in';
							}}
						>
							<LogOut className="w-5 h-5" />
							Logout
						</Button>
					</div>
				</aside>
			)}

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-h-screen relative">
				<div
					className={`flex-1 flex flex-col w-full mx-auto transition-all duration-300 ${!shouldHideNav && user ? 'max-w-7xl lg:px-8' : 'max-w-full'}`}
				>
					{/* Responsive Header */}
					{!shouldHideNav && (
						<header
							className={`flex items-center px-6 py-4 fixed top-0 z-30 transition-all duration-200 w-full left-0 lg:left-auto lg:relative lg:px-0 lg:py-6 ${
								user ? 'lg:max-w-7xl' : 'max-w-full'
							}`}
						>
							{/* Mobile Menu Trigger */}
							{user && (
								<div className="lg:hidden mr-4">
									<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
										<SheetTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="w-10 h-10 rounded-xl ios-glass active:scale-95 transition-all"
											>
												<Menu className="w-5 h-5 text-foreground" />
											</Button>
										</SheetTrigger>
										<SheetContent
											side="left"
											className="w-[300px] bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-0"
										>
											<div className="flex flex-col h-full overflow-hidden">
												<div className="p-8 pb-4 flex-1 overflow-y-auto no-scrollbar">
													<SheetHeader className="text-left mb-8">
														<SheetTitle className="text-xl font-black text-foreground uppercase tracking-tighter">
															MatricMaster
														</SheetTitle>
														<SheetDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-wide">
															Level up your learning
														</SheetDescription>
													</SheetHeader>

													<nav className="space-y-2">
														{sideMenuItems.map((item) => {
															const isActive = pathname === item.href;
															return (
																<Link
																	key={item.href}
																	href={item.href}
																	className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 ${
																		isActive
																			? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
																			: 'text-muted-foreground hover:bg-muted hover:text-foreground'
																	}`}
																	onClick={() => setSheetOpen(false)}
																>
																	<item.icon className="w-5 h-5" />
																	<span className="font-bold text-sm">{item.label}</span>
																</Link>
															);
														})}
													</nav>
												</div>

												<div className="mt-auto p-8 border-t border-border space-y-4">
													<Button
														variant="ghost"
														className="w-full justify-start gap-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl p-4 h-auto font-bold transition-all"
														onClick={async () => {
															await authClient.signOut();
															window.location.href = '/sign-in';
														}}
													>
														<LogOut className="w-5 h-5" />
														Logout
													</Button>
												</div>
											</div>
										</SheetContent>
									</Sheet>
								</div>
							)}

							<Link href="/" className="lg:hidden">
								<p className="font-black text-lg tracking-tighter text-foreground uppercase">
									MatricMaster
								</p>
							</Link>

							<div className="flex-1" />

							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="icon"
									className="w-10 h-10 rounded-xl bg-card/50 backdrop-blur-md border border-border/20 shadow-sm relative hover:bg-card/80 transition-all hidden sm:flex"
									onClick={() => router.push('/notifications')}
								>
									<Bell className="w-5 h-5 text-foreground" />
									{unreadCount > 0 && (
										<motion.span
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm"
										>
											{unreadCount > 99 ? '99+' : unreadCount}
										</motion.span>
									)}
								</Button>

								{!user && (
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											className="font-bold text-sm h-10 px-4 hidden sm:flex"
											onClick={() => router.push('/sign-in')}
										>
											Sign in
										</Button>
										<Button
											className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 px-6 h-10 rounded-xl text-sm"
											onClick={() => router.push('/sign-up')}
										>
											Join Free
										</Button>
									</div>
								)}

								{user && (
									<div className="lg:hidden">
										<ProfileMenu user={user}>
											<motion.button
												type="button"
												className="rounded-full focus:outline-none"
												whileTap={{ scale: 0.9 }}
											>
												<Avatar className="h-10 w-10 border-2 border-background shadow-md">
													<AvatarImage src={user.image || undefined} alt={user.name} />
													<AvatarFallback className="bg-primary text-primary-foreground">
														{user.name?.charAt(0)}
													</AvatarFallback>
												</Avatar>
											</motion.button>
										</ProfileMenu>
									</div>
								)}
							</div>
						</header>
					)}

					<main
						id="main-content"
						className={`flex-1 relative flex flex-col ${!shouldHideNav ? 'pt-20 lg:pt-0' : ''}`}
					>
						<PageTransition>{children}</PageTransition>
					</main>
				</div>

				{/* Bottom Navigation - Only visible on Mobile/Tablet */}
				{!shouldHideBottomNav && user && (
					<nav
						aria-label="Bottom navigation"
						className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-40 ios-glass rounded-3xl shadow-2xl border-white/20 dark:border-white/10 grid grid-cols-5 p-2 transition-all duration-500"
					>
						{navItems.map((item) => {
							const isActive =
								pathname === item.href || (item.href === '/dashboard' && pathname === '/');
							return (
								<Link
									key={item.href}
									href={item.href}
									className="relative flex flex-col items-center justify-center py-2 transition-all duration-300 group rounded-2xl"
								>
									<AnimatePresence>
										{isActive && (
											<motion.div
												layoutId="active-pill"
												className="absolute inset-0 bg-primary rounded-2xl z-0"
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 30,
												}}
											/>
										)}
									</AnimatePresence>

									<div className="relative z-10 flex items-center justify-center">
										<Icon
											icon={item.icon}
											className={`h-6 w-6 transition-all duration-300 ${
												isActive
													? 'text-primary-foreground scale-110'
													: 'text-muted-foreground group-hover:text-foreground'
											}`}
										/>
									</div>
									<span
										className={`relative z-10 text-[9px] font-black uppercase tracking-tighter mt-1 ${
											isActive ? 'text-primary-foreground' : 'text-muted-foreground'
										}`}
									>
										{item.label}
									</span>
								</Link>
							);
						})}
					</nav>
				)}
			</div>

			<style jsx global>{`
				.no-scrollbar::-webkit-scrollbar {
					display: none;
				}
				.no-scrollbar {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				
				/* Selection color */
				::selection {
					background-color: var(--primary);
					color: var(--primary-foreground);
				}
			`}</style>
		</div>
	);
}
