'use client';

import {
	ArrowRight01Icon,
	BookOpen01Icon,
	Cancel01Icon,
	LaptopSettingsIcon,
	Logout01Icon,
	MoonIcon,
	Search01Icon,
	Sun01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { m } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { appConfig } from '@/app.config';
import type { NavItem } from '@/components/Layout/navigation-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useMobileNav } from '@/hooks/useMobileNav';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import type { Theme } from '@/stores/useThemeStore';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun01Icon; color: string }[] = [
	{ value: 'system', label: 'system', icon: LaptopSettingsIcon, color: 'text-violet-500' },
	{ value: 'light', label: 'light', icon: Sun01Icon, color: 'text-amber-500' },
	{ value: 'dark', label: 'dark', icon: MoonIcon, color: 'text-blue-400' },
];

export function MobileNavDrawer({
	children,
	user,
	theme,
	onSetTheme,
}: {
	children: React.ReactNode;
	user: { name?: string | null; email?: string | null; image?: string | null } | null | undefined;
	theme?: string;
	onSetTheme?: (theme: Theme) => void;
}) {
	const {
		open,
		setOpen,
		searchQuery,
		setSearchQuery,
		filteredSections,
		handleSignOut,
		handleNavigation,
	} = useMobileNav();
	const router = useRouter();
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (open) {
			previousFocusRef.current = document.activeElement as HTMLElement;
			setTimeout(() => {
				closeButtonRef.current?.focus();
			}, 100);
		} else if (previousFocusRef.current) {
			previousFocusRef.current.focus();
		}
	}, [open]);

	return (
		<Drawer
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen && router) {
					// Small delay to let the drawer close animation finish
					setTimeout(() => {
						document.body.style.pointerEvents = '';
					}, 300);
				}
				setOpen(isOpen);
			}}
		>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle className="sr-only">navigation menu</DrawerTitle>
				</DrawerHeader>
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-col"
					style={{ maxHeight: '85vh' }}
				>
					<div className="px-4 pb-4 border-b border-sidebar-border/50">
						<div className="flex items-center justify-between mb-3">
							{user ? (
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleNavigation('/profile')}
									className="flex items-center gap-3 p-1.5 -ml-1.5 w-full h-auto rounded-lg hover:bg-sidebar-accent transition-colors text-left focus-visible:ring-2 focus-visible:ring-primary"
								>
									<Avatar className="h-9 w-9">
										<AvatarImage src={user.image || undefined} alt={user.name || 'user'} />
										<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
											{user.name?.charAt(0)?.toLowerCase() || 'u'}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sidebar-foreground text-sm truncate">
											{user.name}
										</p>
										<p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
									</div>
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className="w-4 h-4 text-sidebar-foreground/40"
									/>
								</Button>
							) : (
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleNavigation('/dashboard')}
									className="flex items-center gap-3 h-auto focus-visible:ring-2 focus-visible:ring-primary"
								>
									<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sidebar-primary to-purple-400 flex items-center justify-center">
										<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 text-white" />
									</div>
									<h1 className="text-base font-semibold text-sidebar-foreground">
										{appConfig.name}
									</h1>
								</Button>
							)}
							<Button
								ref={closeButtonRef}
								variant="ghost"
								size="icon"
								className="rounded-lg h-9 w-9 -mr-1 focus-visible:ring-2 focus-visible:ring-primary"
								onClick={() => setOpen(false)}
								aria-label="Close navigation menu"
							>
								<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
							</Button>
						</div>

						<div className="relative">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50"
							/>
							<Input
								type="text"
								placeholder="search pages..."
								aria-label="Search pages"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 bg-sidebar-accent/40 border-transparent rounded-lg h-10 text-sm"
							/>
						</div>
					</div>

					<div className="flex-1 flex flex-col items-start overflow-y-auto px-3 py-3">
						{filteredSections.map((section) => (
							<div key={section.title} className="mb-4">
								<p className="px-2 mb-1.5 text-[10px] font-medium tracking-wider text-sidebar-foreground/40">
									{section.title}
								</p>
								<div className="gap-0.5">
									{section.items.map((item) => (
										<MobileNavLink key={item.href} item={item} onNavigate={handleNavigation} />
									))}
								</div>
							</div>
						))}
						{filteredSections.length === 0 && (
							<div className="text-center py-6 text-sidebar-foreground/50">
								<p className="text-sm">no results found</p>
							</div>
						)}
					</div>

					{theme && onSetTheme && <MobileThemeToggle theme={theme} onSetTheme={onSetTheme} />}

					<div className="px-3 py-3 border-t border-sidebar-border/50">
						<Button
							variant="ghost"
							className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-lg h-11 focus-visible:ring-2 focus-visible:ring-primary"
							onClick={handleSignOut}
						>
							<HugeiconsIcon icon={Logout01Icon} className="w-5 h-5" />
							<span className="text-sm">sign out</span>
						</Button>
					</div>
				</m.div>
			</DrawerContent>
		</Drawer>
	);
}

function MobileNavLink({
	item,
	onNavigate,
}: {
	item: NavItem;
	onNavigate: (href: string) => void;
}) {
	const pathname = usePathname();
	const isActive = pathname === item.href;

	return (
		<Button
			type="button"
			variant="ghost"
			onClick={() => onNavigate(item.href)}
			className={cn(
				'w-full flex items-center justify-start gap-3 px-3 h-11 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-primary',
				isActive
					? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
					: 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
			)}
		>
			{item.fluentEmoji ? (
				<FluentEmoji type="3d" emoji={item.fluentEmoji} size={20} className="w-5 h-5" />
			) : item.icon ? (
				<HugeiconsIcon icon={item.icon} className="w-5 h-5" />
			) : null}
			<span className="text-sm">{item.label}</span>
		</Button>
	);
}

function MobileThemeToggle({
	theme,
	onSetTheme,
}: {
	theme: string;
	onSetTheme: (theme: Theme) => void;
}) {
	const currentIndex = THEME_OPTIONS.findIndex((opt) => opt.value === theme);
	const current = THEME_OPTIONS[currentIndex >= 0 ? currentIndex : 0];

	const handleCycle = () => {
		const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
		onSetTheme(THEME_OPTIONS[nextIndex].value);
	};

	return (
		<div className="px-3 py-2 border-t border-sidebar-border/50">
			<Button
				type="button"
				variant="ghost"
				onClick={handleCycle}
				className="w-full flex items-center justify-between px-3 py-2.5 h-auto rounded-lg bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors group focus-visible:ring-2 focus-visible:ring-primary"
			>
				<span className="text-xs font-medium text-sidebar-foreground/70">{current.label}</span>
				<div className="w-7 h-7 rounded-lg bg-sidebar flex items-center justify-center shadow-sm">
					<HugeiconsIcon icon={current.icon} className={cn('w-4 h-4', current.color)} />
				</div>
			</Button>
		</div>
	);
}

export function MobileMenuButton() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	return (
		<MobileNavDrawer user={user}>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-tiimo hover:bg-card active:scale-95"
				aria-label="open navigation menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<title>menu</title>
					<line x1="4" x2="20" y1="12" y2="12" />
					<line x1="4" x2="20" y1="6" y2="6" />
					<line x1="4" x2="20" y1="18" y2="18" />
				</svg>
			</Button>
		</MobileNavDrawer>
	);
}
