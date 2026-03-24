'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { MenuItem } from './sidebar-menu-data';

interface SidebarMenuSectionProps {
	items: MenuItem[];
	pathname: string;
	onLinkClick: () => void;
}

export function SidebarMenuSection({ items, pathname, onLinkClick }: SidebarMenuSectionProps) {
	return (
		<SidebarMenu className="pt-1 pr-0!">
			{items.map((item) => {
				const isActive = pathname === item.href;
				return (
					<SidebarMenuItem key={item.href}>
						<SidebarMenuButton
							asChild
							isActive={isActive}
							className={cn(
								'pl-3 rounded-xl h-10 transition-colors',
								isActive
									? 'bg-sidebar-primary/10 text-sidebar-primary'
									: 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
							)}
						>
							<Link
								href={item.href}
								transitionTypes={['fade']}
								onClick={onLinkClick}
								className="flex items-center gap-3"
							>
								{item.fluentEmoji ? (
									<FluentEmoji
										type="3d"
										emoji={item.fluentEmoji}
										size={20}
										className={cn(
											'w-5 h-5',
											isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
										)}
									/>
								) : item.icon ? (
									<HugeiconsIcon
										icon={item.icon}
										className={cn(
											'w-5 h-5',
											isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
										)}
									/>
								) : null}
								<span className="font-medium text-[13px] grow truncate">{item.label}</span>
								{isActive && (
									<div className="ml-auto mr-3.5 w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
								)}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}
