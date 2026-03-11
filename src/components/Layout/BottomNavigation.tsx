'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Home, Search, BookOpen, Trophy, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
	href: string;
	label: string;
	icon: React.ElementType;
	isFAB?: boolean;
};

const navItems: NavItem[] = [
	{ href: '/dashboard', label: 'Home', icon: Home },
	{ href: '/past-papers', label: 'Subjects', icon: BookOpen },
	{ href: '/practice-quiz', label: 'Practice', icon: Plus, isFAB: true },
	{ href: '/achievements', label: 'Awards', icon: Trophy },
	{ href: '/profile', label: 'Profile', icon: User },
];

type BottomNavigationProps = {
	pathname: string;
};

export function BottomNavigation({ pathname }: BottomNavigationProps) {
	return (
		<nav
			id="bottom-navigation"
			aria-label="Mobile navigation"
			className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg z-40 bg-card/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-border/50 grid grid-cols-5 p-2 transition-all duration-500"
		>
			{navItems.map((item) => {
				const isActive = pathname.startsWith(item.href) || (item.href === '/dashboard' && pathname === '/');
				const Icon = item.icon;

				if (item.isFAB) {
					return (
						<Link
							key={item.href}
							href={item.href}
							className="relative flex flex-col items-center justify-center -top-8"
						>
							<div className="w-14 h-14 bg-gradient-to-br from-primary-violet to-primary-cyan rounded-2xl flex items-center justify-center shadow-lg shadow-primary-violet/30 active:scale-95 transition-transform">
								<Icon className="w-8 h-8 text-white" />
							</div>
							<span className="text-[10px] font-bold mt-1 text-muted-foreground uppercase tracking-wider">
								{item.label}
							</span>
						</Link>
					);
				}

				return (
					<Link
						key={item.href}
						href={item.href}
						aria-current={isActive ? 'page' : undefined}
						className="relative flex flex-col items-center justify-center py-1 transition-all duration-300 group"
					>
						<div className="relative flex items-center justify-center h-8 w-8">
							<AnimatePresence>
								{isActive && (
									<motion.div
										layoutId="nav-active-bg"
										className="absolute inset-0 bg-primary-violet/10 rounded-xl"
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 30,
										}}
									/>
								)}
							</AnimatePresence>
							<Icon
								className={cn(
									"h-5 w-5 transition-all duration-300 relative z-10",
									isActive
										? 'text-primary-violet scale-110'
										: 'text-muted-foreground group-hover:text-foreground'
								)}
							/>
						</div>
						<span
							className={cn(
								"text-[10px] font-bold mt-1 transition-colors relative z-10 uppercase tracking-wider",
								isActive ? 'text-primary-violet' : 'text-muted-foreground'
							)}
						>
							{item.label}
						</span>
					</Link>
				);
			})}
		</nav>
	);
}
