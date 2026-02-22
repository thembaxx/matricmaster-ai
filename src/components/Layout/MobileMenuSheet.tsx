'use client';

import { LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { authClient } from '@/lib/auth-client';
import { sideMenuItems } from './DesktopSidebar';

type MobileMenuSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pathname: string;
};

export function MobileMenuSheet({ open, onOpenChange, pathname }: MobileMenuSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="w-10 h-10 rounded-xl ios-glass active:scale-95 transition-all"
					aria-label="Open navigation menu"
				>
					<Menu className="w-5 h-5 text-foreground" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] bg-background border-r border-border p-0">
				<MobileMenuContent pathname={pathname} onClose={() => onOpenChange(false)} />
			</SheetContent>
		</Sheet>
	);
}

type MobileMenuContentProps = {
	pathname: string;
	onClose: () => void;
};

function MobileMenuContent({ pathname, onClose }: MobileMenuContentProps) {
	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="p-8 pb-4 flex-1 overflow-y-auto no-scrollbar">
				<SheetHeader className="text-left mb-8">
					<SheetTitle className="text-xl font-black text-foreground uppercase tracking-tighter">
						MatricMaster
					</SheetTitle>
					<SheetDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-wide">
						Level up your learning
					</SheetDescription>
				</SheetHeader>

				<nav className="space-y-2">
					{sideMenuItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 ${
									isActive
										? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground'
								}`}
								onClick={onClose}
							>
								<item.icon className="w-5 h-5" />
								<span className="font-bold text-sm">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="mt-auto p-8 border-t border-border space-y-4">
				<Button
					variant="ghost"
					className="w-full justify-start gap-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl p-4 h-auto font-bold transition-all"
					onClick={async () => {
						await authClient.signOut();
						window.location.href = '/sign-in';
					}}
				>
					<LogOut className="w-5 h-5" />
					Logout
				</Button>
			</div>
		</div>
	);
}
