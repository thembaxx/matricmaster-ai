'use client';

import { Icon } from '@iconify/react';
import { AnimatePresence, m } from 'framer-motion';
import Link from 'next/link';

type NavItem = {
	href: string;
	label: string;
	icon: string;
};

const navItems: NavItem[] = [
	{ href: '/dashboard', label: 'Home', icon: 'fluent:clover-24-filled' },
	{ href: '/search', label: 'Search', icon: 'fluent:search-sparkle-24-filled' },
	{ href: '/review', label: 'Review', icon: 'fluent:brain-sparkle-24-filled' },
	{ href: '/past-papers', label: 'Papers', icon: 'fluent:hat-graduation-sparkle-24-filled' },
	{ href: '/bookmarks', label: 'Saved', icon: 'fluent:bookmark-24-filled' },
];

type BottomNavigationProps = {
	pathname: string;
};

export function BottomNavigation({ pathname }: BottomNavigationProps) {
	return (
		<nav
			aria-label="Bottom navigation"
			className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-40 ios-glass rounded-3xl shadow-2xl border-white/20 dark:border-white/10 grid grid-cols-5 p-2 transition-all duration-500"
		>
			{navItems.map((item) => {
				const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
				return (
					<Link
						key={item.href}
						href={item.href}
						className="relative flex flex-col items-center justify-center py-2 transition-all duration-300 group rounded-2xl"
					>
						<AnimatePresence>
							{isActive && (
								<m.div
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
	);
}
