'use client';

import { Notification03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
	userName?: string;
	userImage?: string;
	unreadCount: number;
}

export function DashboardHeader({ userName, userImage, unreadCount }: DashboardHeaderProps) {
	const router = useRouter();

	return (
		<m.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: 'spring', stiffness: 260, damping: 25 }}
			className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0 relative z-10 lg:px-0 lg:pt-0 lg:mb-8"
		>
			<div className="flex items-center gap-4">
				<m.div
					initial={{ scale: 0.5, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: 'spring', stiffness: 400, damping: 20 }}
					className="relative"
				>
					<Avatar className="w-14 h-14 border-2 border-background shadow-xl relative lg:w-16 lg:h-16">
						<AvatarImage src={userImage ?? ''} alt={userName ?? 'User'} />
						<AvatarFallback>{userName?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
					</Avatar>
					<div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full lg:w-5 lg:h-5 lg:border-3" />
				</m.div>
				<div>
					<p className="text-muted-foreground text-[10px] font-black  tracking-[0.2em] opacity-60 lg:text-xs">
						Welcome back,
					</p>
					<SmoothWords
						as="h2"
						text={userName?.split(' ')[0] ?? 'Student'}
						className="text-2xl font-black text-foreground leading-none tracking-tighter lg:text-4xl"
					/>
				</div>
			</div>

			<div className="flex items-center gap-3 lg:hidden">
				<m.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
					<Button
						variant="ghost"
						size="icon"
						className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/20 shadow-sm relative"
						onClick={() => {
							if (!userName) {
								toast.info('Login Required', {
									description: 'Please sign in to view your notifications.',
								});
								router.push('/sign-in');
								return;
							}
							router.push('/notifications');
						}}
						aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
					>
						<HugeiconsIcon icon={Notification03Icon} className="w-6 h-6 text-foreground" />
						{unreadCount > 0 && (
							<m.span
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ scale: 1 }}
								className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm"
							>
								{unreadCount > 99 ? '99+' : unreadCount}
							</m.span>
						)}
					</Button>
				</m.div>
			</div>
		</m.header>
	);
}
