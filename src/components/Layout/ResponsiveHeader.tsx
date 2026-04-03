'use client';

import { Notification01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { appConfig } from '@/app.config';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { ProfileMenu } from './ProfileMenu';

const desktopNavItems = [
	{ href: '/dashboard', label: 'dashboard' },
	{ href: '/schedule', label: 'schedule' },
	{ href: '/planner', label: 'planner' },
	{ href: '/focus', label: 'focus' },
	{ href: '/profile', label: 'profile' },
];

type AuthUser = typeof authClient.$Infer.Session.user;

type ResponsiveHeaderProps = {
	user: AuthUser | null;
	unreadCount: number;
	onNotificationClick: () => void;
	onSignIn: () => void;
	onSignUp: () => void;
	mobileMenuTrigger?: React.ReactNode;
};

export function ResponsiveHeader({
	user,
	unreadCount,
	onNotificationClick,
	onSignIn,
	onSignUp,
	mobileMenuTrigger,
}: ResponsiveHeaderProps) {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<header
			className={cn(
				'flex items-center pr-6 py-4 fixed top-0 z-30 transition-all duration-300 w-full left-0 lg:relative lg:px-6 lg:py-8',
				user ? 'pl-6' : 'pl-6',
				scrolled
					? 'ios-glass py-3 shadow-lg lg:shadow-none lg:bg-transparent lg:border-none'
					: 'bg-transparent'
			)}
		>
			<div className="hidden lg:flex items-center gap-8">
				<Link href="/" transitionTypes={['fade']} className="shrink-0">
					<p className="font-bold text-xs tracking-wider text-foreground">
						{appConfig.name.toLowerCase()}
					</p>
				</Link>
				<nav className="flex items-center gap-6">
					{desktopNavItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							transitionTypes={['fade']}
							className={cn(
								'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
								{
									'text-primary font-semibold': pathname.includes(item.href),
								}
							)}
						>
							{item.label}
						</Link>
					))}
				</nav>
			</div>

			{user && <div className="lg:hidden mr-4">{mobileMenuTrigger}</div>}

			<Link href="/" transitionTypes={['fade']} className="lg:hidden">
				<p className="font-bold text-lg tracking-tighter text-foreground">
					{appConfig.name.toLowerCase()}
				</p>
			</Link>

			<div className="flex-1" />

			<div className="flex items-center gap-3">
				<ConnectionStatus />
				<NotificationButton count={unreadCount} onClick={onNotificationClick} />

				{!user ? (
					<AuthButtons onSignIn={onSignIn} onSignUp={onSignUp} />
				) : (
					<ProfileMenu user={user}>
						<m.button
							type="button"
							className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							whileTap={{ scale: 0.9 }}
							aria-label="User profile menu"
						>
							<Avatar className="h-10 w-10 border-2 border-background shadow-md">
								<AvatarImage src={user.image || undefined} alt={user.name} />
								<AvatarFallback className="bg-primary text-primary-foreground">
									{user.name?.charAt(0)}
								</AvatarFallback>
							</Avatar>
						</m.button>
					</ProfileMenu>
				)}
			</div>
		</header>
	);
}

type NotificationButtonProps = {
	count: number;
	onClick: () => void;
};

function NotificationButton({ count, onClick }: NotificationButtonProps) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className="w-10 h-10 rounded-xl bg-card/50 backdrop-blur-md border border-border/20 shadow-sm relative hover:bg-card/80 transition-all hidden sm:flex"
			onClick={onClick}
			aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
		>
			<HugeiconsIcon
				icon={Notification01Icon}
				className="w-5 h-5 text-foreground"
				aria-hidden="true"
			/>
			{count > 0 && (
				<m.span
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1 }}
					className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
				>
					{count > 99 ? '99+' : count}
				</m.span>
			)}
		</Button>
	);
}

type AuthButtonsProps = {
	onSignIn: () => void;
	onSignUp: () => void;
};

function AuthButtons({ onSignIn, onSignUp }: AuthButtonsProps) {
	return (
		<div className="flex items-center gap-2">
			<m.div whileTap={{ scale: 0.95 }}>
				<Button
					variant="ghost"
					className="font-bold text-sm h-10 px-4 hidden sm:flex"
					onClick={onSignIn}
				>
					Sign in
				</Button>
			</m.div>
			<m.div whileTap={{ scale: 0.95 }}>
				<Button
					className="bg-primary hover:bg-primary/90 text-white/90 font-bold shadow-lg shadow-primary/20 px-6 h-10 rounded-xl text-sm"
					onClick={onSignUp}
				>
					Join free
				</Button>
			</m.div>
		</div>
	);
}
