'use client';

import {
	AiBrain01Icon,
	BookOpen01Icon,
	DashboardSpeed02Icon,
	File01Icon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import Link from 'next/link';
import { memo } from 'react';

const navItems = [
	{
		href: '/dashboard',
		label: 'home',
		icon: DashboardSpeed02Icon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/learn',
		label: 'learn',
		icon: BookOpen01Icon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/practice',
		label: 'practice',
		icon: File01Icon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/ai-lab',
		label: 'brain',
		icon: AiBrain01Icon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		href: '/community',
		label: 'social',
		icon: UserGroupIcon,
		activeColor: 'text-primary',
		bgColor: 'bg-primary/10',
	},
];

interface BottomNavigationProps {
	pathname: string;
}

export const BottomNavigation = memo(function BottomNavigation({
	pathname,
}: BottomNavigationProps) {
	return (
		<m.nav
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			transition={{ type: 'spring', stiffness: 260, damping: 20 }}
			id="bottom-navigation"
			aria-label="bottom navigation"
			className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-20 tiimo-glass rounded-[2.5rem] shadow-tiimo-lg grid grid-cols-5 p-1.5"
			style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px)' }}
		>
			{navItems.map((item) => {
				const isActive =
					pathname === item.href ||
					(item.href === '/learn' &&
						(pathname === '/lessons' || pathname === '/physics' || pathname === '/math')) ||
					(item.href === '/practice' && (pathname === '/past-papers' || pathname === '/quiz'));
				return (
					<Link
						key={item.href}
						href={item.href}
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
										isActive ? item.activeColor : 'text-tiimo-black-30'
									}`}
								/>
							</m.div>
							<span
								className={`label-xs font-bold tracking-tight transition-colors duration-300 capitalize ${
									isActive ? 'text-foreground' : 'text-tiimo-black-50'
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
});
