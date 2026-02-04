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

	// Extract the first segment of the path to check generic routes if needed
	// or matches exact paths.
	// Assuming simple paths for now.
	const shouldHideNav = hideNavigation.some((path) => pathname.startsWith(path));

	return (
		<div className="flex justify-center items-center min-h-screen bg-background p-0 sm:p-4">
			<div className="w-full max-w-[420px] h-full min-h-screen sm:min-h-[850px] sm:h-[900px] bg-background sm:rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 border-x border-border">
				{children}

				{/* Bottom Navigation - Refined glassmorphism */}
				{!shouldHideNav && (
					<nav className="absolute bottom-4 left-4 right-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-zinc-800/50 flex justify-between items-center px-8 py-4 rounded-[2.5rem] shadow-2xl z-50 animate-in slide-in-from-bottom-10 duration-700">
						<Link
							href="/"
							className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${pathname === '/' ? 'text-brand-blue scale-110' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
						>
							<Home className="w-6 h-6" strokeWidth={pathname === '/' ? 3 : 2} />
							<span
								className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/' ? 'opacity-100' : 'opacity-0 scale-75'}`}
							>
								Home
							</span>
						</Link>
						<Link
							href="/search"
							className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${pathname === '/search' ? 'text-brand-blue scale-110' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
						>
							<SearchIcon className="w-6 h-6" strokeWidth={pathname === '/search' ? 3 : 2} />
							<span
								className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/search' ? 'opacity-100' : 'opacity-0 scale-75'}`}
							>
								Search
							</span>
						</Link>
						<Link
							href="/bookmarks"
							className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${pathname === '/bookmarks' ? 'text-brand-blue scale-110' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
						>
							<Bookmark className="w-6 h-6" strokeWidth={pathname === '/bookmarks' ? 3 : 2} />
							<span
								className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/bookmarks' ? 'opacity-100' : 'opacity-0 scale-75'}`}
							>
								Saved
							</span>
						</Link>
						<Link
							href="/profile"
							className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${pathname === '/profile' ? 'text-brand-blue scale-110' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
						>
							<User className="w-6 h-6" strokeWidth={pathname === '/profile' ? 3 : 2} />
							<span
								className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/profile' ? 'opacity-100' : 'opacity-0 scale-75'}`}
							>
								Profile
							</span>
						</Link>
					</nav>
				)}
			</div>
		</div>
	);
}
