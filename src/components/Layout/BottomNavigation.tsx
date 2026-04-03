'use client';

import {
	Calendar01Icon,
	DashboardSpeed02Icon,
	MagicWandIcon,
	Search01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';

const navItems = [
	{
		href: '/dashboard',
		label: 'dashboard',
		icon: DashboardSpeed02Icon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/schedule',
		label: 'daily',
		icon: Calendar01Icon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/planner',
		label: 'planner',
		icon: MagicWandIcon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/focus',
		label: 'focus',
		icon: Search01Icon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/profile',
		label: 'me',
		icon: UserIcon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
];

interface BottomNavigationProps {
	pathname: string;
}

export function BottomNavigation({ pathname }: BottomNavigationProps) {
	return (
		<m.nav
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			transition={{ type: 'spring', stiffness: 260, damping: 20 }}
			id="bottom-navigation"
			aria-label="Bottom navigation"
			className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-20 tiimo-glass rounded-[2.5rem] shadow-tiimo-lg grid grid-cols-5 p-1.5"
			style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px)' }}
		>
			{navItems.map((item) => {
				const isActive = pathname === item.href || (item.href === '/schedule' && pathname === '/');
				return (
					<Link
						key={item.href}
						href={item.href}
						transitionTypes={['fade']}
						aria-current={isActive ? 'page' : undefined}
						className="relative flex flex-col items-center justify-center py-1.5 min-h-[76px] transition-all duration-300 group"
					>
						<div className="relative z-10 flex flex-col items-center justify-center gap-1">
							<m.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.9 }}
								className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 tiimo-press ${
									isActive ? item.bgColor : 'bg-transparent'
								}`}
							>
								<HugeiconsIcon
									icon={item.icon}
									className={`w-6 h-6 transition-colors duration-300 ${
										isActive ? item.activeColor : 'text-tiimo-gray-muted'
									}`}
								/>
							</m.div>
							<span
								className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${
									isActive ? 'text-foreground' : 'text-tiimo-gray-muted'
								}`}
							>
								{item.label}
							</span>
						</div>

						{isActive && (
							<m.div
								layoutId="nav-active-dot"
								className={`absolute -bottom-1 w-1 h-1 rounded-full ${item.activeColor.replace('text-', 'bg-')}`}
							/>
						)}
					</Link>
				);
			})}
		</m.nav>
	);
}
