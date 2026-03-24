'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { authClient } from '@/lib/auth-client';
import { ProfileMenu } from './profile-menu';

type AuthUser = typeof authClient.$Infer.Session.user;

interface SidebarUserProfileProps {
	user: AuthUser;
}

export function SidebarUserProfile({ user }: SidebarUserProfileProps) {
	return (
		<ProfileMenu user={user}>
			<Button
				type="button"
				variant="ghost"
				className="w-full flex items-center gap-3 p-2 h-auto rounded-xl hover:bg-sidebar-accent transition-colors text-left focus-visible:ring-2 focus-visible:ring-primary"
			>
				<Avatar className="h-10 w-10 border-2 border-sidebar-primary/30 shadow-sm">
					<AvatarImage src={user.image || undefined} alt={user.name} />
					<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
						{user.name?.charAt(0)?.toLowerCase() || 'u'}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
					<p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
				</div>
			</Button>
		</ProfileMenu>
	);
}
