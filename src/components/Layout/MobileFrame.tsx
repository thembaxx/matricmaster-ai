'use client';

import {
	Bookmark,
	FileText,
	Home,
	LogOut,
	Menu,
	Moon,
	Search as SearchIcon,
	Settings,
	Sun,
	User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

export default function MobileFrame({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	const hideNavigation = ['/sign-in', '/sign-up', '/interactive-quiz'];

	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/search', label: 'Search', icon: SearchIcon },
		{ href: '/past-papers', label: 'Papers', icon: FileText },
		{ href: '/bookmarks', label: 'Saved', icon: Bookmark },
		{ href: '/profile', label: 'Profile', icon: User },
	];

	const sideMenuItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: Home },
		{ href: '/past-papers', label: 'Past Papers', icon: FileText },
		{ href: '/bookmarks', label: 'My Saved Items', icon: Bookmark },
		{ href: '/profile', label: 'My Profile', icon: User },
		{ href: '/settings', label: 'Settings', icon: Settings },
	];

	return (
		<div className="flex justify-center items-center min-h-screen bg-background p-0 sm:p-4">
			<div className="w-full max-w-[420px] h-full min-h-screen sm:min-h-[850px] sm:h-[900px] bg-background sm:rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 border-x border-border">
				{/* Global Top Navigation Bar */}
				{!shouldHideNav && (
					<div className="absolute top-4 left-4 z-[60] pointer-events-none">
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="w-10 h-10 rounded-xl bg-white/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/40 dark:border-zinc-800/40 shadow-xl pointer-events-auto active:scale-90 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/60"
								>
									<Menu className="w-5 h-5 text-zinc-900 dark:text-white" />
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-[300px] sm:w-[350px] bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-0"
							>
								<div className="flex flex-col h-full">
									<div className="p-8 pb-4">
										<SheetHeader className="text-left mb-8">
											<SheetTitle className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
												MatricMaster
											</SheetTitle>
											<SheetDescription className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
												Level up your learning
											</SheetDescription>
										</SheetHeader>

										<div className="space-y-2">
											{sideMenuItems.map((item) => {
												const isActive = pathname === item.href;
												return (
													<Link
														key={item.href}
														href={item.href}
														className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
															isActive
																? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
																: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
														}`}
													>
														<item.icon className="w-5 h-5" />
														<span className="font-bold">{item.label}</span>
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
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				)}

				<div className="flex-1 relative overflow-hidden flex flex-col">{children}</div>

				{/* Bottom Navigation - Fixed Bottom Bar */}
				{!shouldHideNav && (
					<nav
						className="absolute bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center py-2 px-2 transition-all duration-500"
						style={{
							paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
						}}
					>
						{navItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[56px] transition-all duration-300"
								>
									{/* Active background pill */}
									{isActive && (
										<div
											className="absolute inset-0 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-2xl animate-fade-in"
											style={{
												animation: 'pillPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
											}}
										/>
									)}

									{/* Icon container with iOS-style tap animation */}
									<div className="relative flex items-center justify-center">
										<item.icon
											className={`relative z-10 transition-all duration-300 ${
												isActive
													? 'text-brand-blue scale-110'
													: 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
											}`}
											strokeWidth={isActive ? 2.5 : 2}
											size={24}
										/>
									</div>

									{/* Label with subtle animation */}
									<span
										className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 mt-1 ${
											isActive ? 'text-brand-blue opacity-100' : 'text-zinc-400 opacity-0'
										}`}
									>
										{item.label}
									</span>
								</Link>
							);
						})}
					</nav>
				)}

				{/* iOS-style custom scrollbar */}
				<style>{`
					/* iOS Spring Animations */
					@keyframes pillPop {
						0% {
							transform: scale(0.85);
							opacity: 0;
						}
						100% {
							transform: scale(1);
							opacity: 1;
						}
					}

					@keyframes slideIn {
						0% {
							transform: translateY(20px);
							opacity: 0;
						}
						100% {
							transform: translateY(0);
							opacity: 1;
						}
					}

					/* iOS-style active press effect */
					nav a:active svg {
						transform: scale(0.9);
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

				`}</style>
			</div>
		</div>
	);
}
