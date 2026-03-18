'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { User } from '@/lib/db/better-auth-schema';
import { RoleBadge, UserStatusBadge } from './StatusBadge';

interface UserManagerProps {
	users: User[];
}

export function UserManager({ users }: UserManagerProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{users.map((u) => (
				<Card
					key={u.id}
					className="rounded-[2rem] border-2 border-border/50 hover:border-primary/20 cursor-pointer transition-all duration-300 group"
				>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-16 w-16 border-2 border-background shadow-xl">
								<AvatarImage src={u.image || undefined} alt={u.name} />
								<AvatarFallback className="bg-primary text-primary-foreground font-black text-xl">
									{u.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<h3 className="font-black text-lg text-foreground truncate tracking-tighter">
									{u.name}
								</h3>
								<p className="text-xs font-bold text-muted-foreground truncate">{u.email}</p>
							</div>
						</div>

						<div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
							<RoleBadge role={u.role || 'user'} />
							<UserStatusBadge isBlocked={u.isBlocked} deletedAt={u.deletedAt} />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
