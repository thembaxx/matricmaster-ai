'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';

export function ProfileMenu({
	children,
	user,
}: {
	children: React.ReactNode;
	user: typeof authClient.$Infer.Session.user;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuGroup>
					<DropdownMenuItem className="p-2">
						<div>
							<div className="h-12 w-12 mb-4 relative">
								<Avatar className="h-12 w-12">
									<AvatarImage src={user.image || undefined} alt={user.name} />
									<AvatarFallback className="bg-[linear-gradient(318.67deg,rgb(106,255,94)_0%,rgb(13,255,247)_94.35%)] text-neutral-800">
										{user.name?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="absolute -mb-0.5 bottom-0 right-0 z-10">
									<Icon icon="material-symbols-light:verified" className="text-blue-600 w-5 h-5" />
								</div>
							</div>
							<div className="space-y-0 text-left">
								<h2 className="font-bold truncate">{user.name}</h2>
								<p className="text-muted-foreground text-[0.85rem]">{user.email}</p>
								<div className="flex gap-4 items-center pt-4">
									<Badge className="text-white/90">Badge</Badge>
									<div className="flex items-center gap-2">
										<Icon icon="fluent:star-20-filled" className="h-4 w-4 text-[#FF990A]" />
										<span className="text-[0.85rem]">4.3</span>
									</div>
								</div>
							</div>
						</div>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/profile">Manage profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem>Contact support</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						await authClient.signOut();
					}}
				>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
