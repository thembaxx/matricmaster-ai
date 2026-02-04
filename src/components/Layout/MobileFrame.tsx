'use client';

import { Bookmark, Home, Search as SearchIcon, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileFrame({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const hideNavigation = [
		'/quiz',
		'/math-quiz',
		'/physics',
		'/past-paper',
		'/study-plan',
		'/cms',
		'/lesson-complete',
		'/error-hint',
		'/channels',
		'/study-path',
		'/leaderboard',
		'/language',
	];

	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/search', label: 'Search', icon: SearchIcon },
		{ href: '/bookmarks', label: 'Saved', icon: Bookmark },
		{ href: '/profile', label: 'Profile', icon: User },
	];

	return (
		<div className="flex justify-center items-center min-h-screen bg-background p-0 sm:p-4">
			<div className="w-full max-w-[420px] h-full min-h-screen sm:min-h-[850px] sm:h-[900px] bg-background sm:rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 border-x border-border">
				{children}

				{/* Bottom Navigation - iOS-style with safe area and animations */}
				{!shouldHideNav && (
					<nav
						className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800/50 flex justify-around items-center pb-safe pt-2 z-50"
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
									className="relative flex flex-col items-center justify-center min-w-[64px] min-h-[60px] transition-all duration-300"
								>
									{/* Active pill indicator */}
									{isActive && (
										<div
											className="absolute -top-1 w-10 h-1 bg-brand-blue rounded-full shadow-[0_2px_8px_rgba(37,99,235,0.3)] animate-slide-in"
											style={{
												animation: 'pillSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
											}}
										/>
									)}

									{/* Icon container with iOS-style tap animation */}
									<div className="relative flex items-center justify-center">
										{/* Ripple effect on active */}
										{isActive && (
											<div className="absolute inset-0 bg-brand-blue/20 rounded-full animate-ping" />
										)}

										<item.icon
											className={`relative z-10 transition-all duration-300 ${
												isActive
													? 'text-brand-blue scale-110'
													: 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
											}`}
											strokeWidth={isActive ? 2.5 : 2}
											size={28}
										/>
									</div>

									{/* Label with subtle animation */}
									<span
										className={`text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
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
					@keyframes pillSlide {
						0% {
							transform: translateY(100%);
							opacity: 0;
						}
						60% {
							transform: translateY(-20%);
						}
						100% {
							transform: translateY(0);
							opacity: 1;
						}
					}

					@keyframes ping {
						75%, 100% {
							transform: scale(2);
							opacity: 0;
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

					/* Safe area support for iOS notch */
					@supports (padding: max(0px)) {
						nav {
							padding-bottom: max(8px, env(safe-area-inset-bottom));
						}
					}
				`}</style>
			</div>
		</div>
	);
}
