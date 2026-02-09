'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
	Award,
	Bookmark,
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
	Sun,
	Trophy,
	User,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function MobileFrame({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	const [sheetOpen, setSheetOpen] = useState(false);

	// const hideNavigation = ['/sign-in', '/sign-up', '/interactive-quiz'];
	const hideNavigation: string[] = [];
	const hideBottomNavigation = ['/sign-in', '/sign-up'];

	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));
	const shouldHideBottomNav = hideBottomNavigation.some((path) => pathname.startsWith(path));

	const navItems = [
		{ href: '/dashboard', label: 'Home', icon: "fluent:clover-24-filled" },
		{ href: '/search', label: 'Search', icon: "fluent:search-sparkle-24-filled" },
		{ href: '/past-papers', label: 'Papers', icon: "fluent:hat-graduation-sparkle-24-filled" },
		{ href: '/bookmarks', label: 'Saved', icon: "fluent:bookmark-24-filled" },
	];

	const sideMenuItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: Home },
		{ href: '/search', label: 'Search', icon: SearchIcon },
		{ href: '/past-papers', label: 'Past Papers', icon: FileText },
		{ href: '/study-path', label: 'Study Path', icon: MapIcon },
		{ href: '/study-plan', label: 'Study Plan', icon: Calendar },
		{ href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
		{ href: '/achievements', label: 'Achievements', icon: Award },
		{ href: '/channels', label: 'Study Channels', icon: Users },
		{ href: '/bookmarks', label: 'My Saved Items', icon: Bookmark },
		{ href: '/profile', label: 'My Profile', icon: User },
		{ href: '/language', label: 'Language', icon: Globe },
		{ href: '/settings', label: 'Settings', icon: Settings },
		{ href: '/cms', label: 'Content Management', icon: Layout },
	];

	return (
		<div className="flex justify-center items-center min-h-screen bg-background p-0 overflow-hidden">
			<div className="w-full h-full min-h-screen sm:min-h-212.5 sm:h-225 bg-background sm:rounded-[2rem] relative flex flex-col transition-colors duration-300">
				{/* Global Top Navigation Bar */}
				{!shouldHideNav && (
					<header
						className="flex items-center pointer-events-none px-6 gap-3 pb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl fixed top-0 z-20 transition-all duration-200 max-w-2xl mx-auto w-full"
						style={{
							paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
						}}
					>
						<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="w-12 h-12 p-0 rounded-md! ios-glass pointer-events-auto ios-active-scale"
								>
									<Menu className="w-5! h-5! text-zinc-900 dark:text-white" />
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-75 sm:w-87.5 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-0"
							>
								<div className="flex flex-col h-full">
									<div className="p-8 pb-4 flex-1 overflow-y-auto">
										<SheetHeader className="text-left mb-8">
											<SheetTitle className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
												MatricMaster
											</SheetTitle>
											<SheetDescription className="text-zinc-500 font-bold text-xs uppercase tracking-wide">
												Level up your learning
											</SheetDescription>
											{!session && (
												<div className="grid grid-cols-2 gap-2 mt-4">
													<Button
														size="sm"
														className="dark:text-white/90"
														onClick={() => {
															setSheetOpen(false);
															router.push('/sign-in');
														}}
													>
														Sign in
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => {
															setSheetOpen(false);
															router.push('/sign-up');
														}}
													>
														Sign up
													</Button>
												</div>
											)}
										</SheetHeader>

										<div className="space-y-2 ">
											{sideMenuItems.map((item) => {
												const isActive = pathname === item.href;
												return (
													<Link
														key={item.href}
														href={item.href}
														className={`flex items-center gap-4 p-2 rounded-2xl transition-all duration-200 ${
															isActive
																? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
																: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
														}`}
														onClick={() => setSheetOpen(false)}
													>
														<item.icon className="w-5 h-5" />
														<span className="font-bold text-sm">{item.label}</span>
													</Link>
												);
											})}
										</div>
									</div>

									<div className="mt-auto p-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
										<div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
											<span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
												Theme
											</span>
											<Button
												variant="ghost"
												size="sm"
												className="rounded-xl bg-white dark:bg-zinc-800 shadow-sm"
												onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
											>
												{theme === 'dark' ? (
													<Sun className="w-4 h-4 text-yellow-500" />
												) : (
													<Moon className="w-4 h-4 text-zinc-600" />
												)}
											</Button>
										</div>

										{session && (
											<Button
												variant="ghost"
												className="w-full justify-start gap-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl p-4 h-auto font-bold transition-all"
												onClick={async () => {
													await authClient.signOut();
													router.push('/sign-in');
												}}
											>
												<LogOut className="w-5 h-5" />
												Logout
											</Button>
										)}
									</div>
								</div>
							</SheetContent>
						</Sheet>
						<Link href="/" className="grow">
							<p className="font-bold text-sm tracking-wider text-zinc-900 dark:text-white uppercase">
								MatricMaster
							</p>
						</Link>
						{user && (
							<div className="flex items-center space-x-2">
								<Avatar className="h-10 w-10">
									<AvatarImage src={user.image || undefined} alt={user.name} />
									<AvatarFallback className="bg-[linear-gradient(318.67deg,rgb(106,255,94)_0%,rgb(13,255,247)_94.35%)] text-neutral-800">
										{user.name?.charAt(0)}
									</AvatarFallback>
								</Avatar>
							</div>
						)}
					</header>
				)}

				<div className="flex-1 relative overflow-hidden flex flex-col pt-20">{children}</div>

				{/* Bottom Navigation - iOS Liquid Glass Floating Pill */}
				{!shouldHideBottomNav && (
					<nav
						className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-95 z-100 ios-glass rounded-[2.5rem] shadow-2xl shadow-black/5 grid grid-cols-4 p-2 px-3 transition-all duration-500 ease-ios"
						style={{
							marginBottom: 'env(safe-area-inset-bottom, 0px)',
						}}
					>
						{navItems.map((item) => {
							const isActive =
								pathname === item.href || (item.href === '/dashboard' && pathname === '/');
							return (
								<Link
									key={item.href}
									href={item.href}
									className="relative flex flex-col items-center justify-center min-w-16 py-2 transition-all duration-300 group"
								>
									<AnimatePresence>
										{isActive && (
											<motion.div
												layoutId="active-pill"
												className="absolute inset-0 bg-zinc-200/50 dark:bg-zinc-700/50 rounded-full z-0"
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 30,
												}}
											/>
										)}
									</AnimatePresence>

									{/* Icon container */}
									<div className="relative z-10 flex items-center justify-center">
										<Icon
										icon={item.icon}
											className={`relative transition-all duration-300 h-6 w-6 ${
												isActive
													? 'text-brand-blue dark:text-brand-blue-light scale-110'
													: 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200'
											}`}
											
											
										/>
									</div>

									{/* Label */}
									<span
										className={`relative z-10 text-[9px] font-semibold uppercase tracking-wide transition-all duration-300 mt-1 ${
											isActive
												? 'text-brand-blue dark:text-brand-blue-light font-black'
												: 'text-zinc-400'
										}`}
									>
										{item.label}
									</span>
								</Link>
							);
						})}
					</nav>
				)}

				{/* Custom scrollbar styling */}
				<style>{`
					/* iOS-style active press effect */
					nav a:active {
						transform: scale(0.95);
						transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
					}

					/* Custom scrollbar styling */
					::-webkit-scrollbar {
						width: 0px;
						background: transparent;
					}

					/* Hide scrollbar for Firefox */
					* {
						scrollbar-width: none;
						-ms-overflow-style: none;
					}

					.ease-ios {
						transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
					}
				`}</style>
			</div>
		</div>
	);
}
