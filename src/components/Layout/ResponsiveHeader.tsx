'use client';

import { m } from 'framer-motion';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { ProfileMenu } from './profile-menu';

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
				'flex items-center pr-6 py-4 fixed top-0 z-30 transition-all duration-300 w-full left-0 lg:relative lg:px-0 lg:py-8',
				user ? 'pl-6' : 'pl-6',
				scrolled
					? 'ios-glass py-3 shadow-lg lg:shadow-none lg:bg-transparent lg:border-none'
					: 'bg-transparent'
			)}
		>
			{user && <div className="lg:hidden mr-4">{mobileMenuTrigger}</div>}

			<Link href="/" className="lg:hidden">
				<p className="font-black text-lg tracking-tighter text-foreground uppercase">
					MatricMaster
				</p>
			</Link>

			<div className="flex-1" />

			<div className="flex items-center gap-3">
				<NotificationButton count={unreadCount} onClick={onNotificationClick} />

				{!user ? (
					<AuthButtons onSignIn={onSignIn} onSignUp={onSignUp} />
				) : (
					<div className="lg:hidden">
						<ProfileMenu user={user}>
							<m.button
								type="button"
								className="rounded-full focus:outline-none"
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
					</div>
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
			<Bell className="w-5 h-5 text-foreground" />
			{count > 0 && (
				<m.span
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1 }}
					className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm"
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
			<Button
				variant="ghost"
				className="font-bold text-sm h-10 px-4 hidden sm:flex"
				onClick={onSignIn}
			>
				Sign in
			</Button>
			<Button
				className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 px-6 h-10 rounded-xl text-sm"
				onClick={onSignUp}
			>
				Join Free
			</Button>
		</div>
	);
}
