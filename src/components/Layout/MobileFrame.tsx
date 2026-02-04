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
	];

	// Extract the first segment of the path to check generic routes if needed
	// or matches exact paths. 
    // Assuming simple paths for now.
    const shouldHideNav = hideNavigation.some(path => pathname.startsWith(path));

	return (
		<div className="flex justify-center items-center min-h-screen bg-background p-0 sm:p-4">
			<div className="w-full max-w-[420px] h-full min-h-screen sm:min-h-[850px] sm:h-[900px] bg-background sm:rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 border-x border-border">
				{children}

				{/* Bottom Navigation */}
				{!shouldHideNav && (
					<nav className="absolute bottom-0 w-full bg-card/95 backdrop-blur-xl border-t border-border flex justify-between items-center px-6 py-3 pb-6 z-50">
						<Link
							href="/"
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${pathname === '/' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<Home className="w-6 h-6" strokeWidth={pathname === '/' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Home</span>
						</Link>
						<Link
							href="/search"
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${pathname === '/search' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<SearchIcon className="w-6 h-6" strokeWidth={pathname === '/search' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Search</span>
						</Link>
						<Link
							href="/bookmarks"
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${pathname === '/bookmarks' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<Bookmark className="w-6 h-6" strokeWidth={pathname === '/bookmarks' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Saved</span>
						</Link>
						<Link
							href="/profile"
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${pathname === '/profile' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<User className="w-6 h-6" strokeWidth={pathname === '/profile' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Profile</span>
						</Link>
					</nav>
				)}
			</div>
		</div>
	);
}
