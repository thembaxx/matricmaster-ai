'use client';

import { m } from 'framer-motion';
import Link from 'next/link';

const navItems = [
	{ href: '/schedule', label: 'Schedule', emoji: '📅', color: 'bg-primary/20' },
	{ href: '/planner', label: 'Planner', emoji: '🤖', color: 'bg-success/20' },
	{ href: '/focus', label: 'Focus', emoji: '⏱️', color: 'bg-warning/20' },
	{ href: '/profile', label: 'Profile', emoji: '👤', color: 'bg-purple-500/20' },
];

interface BottomNavigationProps {
	pathname: string;
}

export function BottomNavigation({ pathname }: BottomNavigationProps) {
	return (
		<m.nav
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			transition={{ type: 'spring', stiffness: 300, damping: 30 }}
			id="bottom-navigation"
			aria-label="Bottom navigation"
			className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 tiimo-glass rounded-[2rem] shadow-xl grid grid-cols-4 p-2"
		>
			{navItems.map((item) => {
				const isActive = pathname === item.href || (item.href === '/schedule' && pathname === '/');
				return (
					<Link
						key={item.href}
						href={item.href}
						aria-current={isActive ? 'page' : undefined}
						className="relative flex flex-col items-center justify-center py-2 min-h-[72px] transition-all duration-300 group rounded-xl"
					>
						<m.div
							layoutId="active-indicator"
							className="absolute inset-1 bg-card rounded-xl z-0 shadow-sm"
							transition={{ type: 'spring', stiffness: 400, damping: 30 }}
						/>

						<div className="relative z-10 flex flex-col items-center justify-center gap-1">
							<m.div
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
									isActive ? item.color : 'bg-transparent'
								}`}
							>
								<span className="text-2xl">{item.emoji}</span>
							</m.div>
							<span
								className={`text-[11px] font-semibold transition-colors ${
									isActive ? 'text-foreground' : 'text-muted-foreground'
								}`}
							>
								{item.label}
							</span>
						</div>
					</Link>
				);
			})}
		</m.nav>
	);
}
