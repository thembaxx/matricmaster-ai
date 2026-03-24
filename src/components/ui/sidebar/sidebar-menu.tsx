'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSidebar } from './use-sidebar';

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
	({ className, ...props }, ref) => (
		<ul
			ref={ref}
			data-sidebar="menu"
			className={cn('flex w-full min-w-0 flex-col gap-1', className)}
			{...props}
		/>
	)
);
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
	({ className, ...props }, ref) => (
		<li
			ref={ref}
			data-sidebar="menu-item"
			className={cn('group/menu-item relative', className)}
			{...props}
		/>
	)
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

type SidebarMenuButtonProps = React.ComponentProps<'button'> & {
	asChild?: boolean;
	isActive?: boolean;
	tooltip?: string | React.ComponentProps<typeof TooltipContent>;
};

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
	({ asChild = false, isActive = false, tooltip, className, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		const { isMobile, state } = useSidebar();

		const button = (
			<Comp
				ref={ref}
				data-sidebar="menu-button"
				data-active={isActive}
				className={cn(
					'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
					className
				)}
				{...props}
			/>
		);

		if (!tooltip) {
			return button;
		}

		const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip;

		return (
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent
					side="right"
					align="center"
					hidden={state !== 'collapsed' || isMobile}
					{...tooltipProps}
				/>
			</Tooltip>
		);
	}
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

type SidebarMenuSkeletonProps = React.ComponentProps<'div'> & { showIcon?: boolean };

export const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, SidebarMenuSkeletonProps>(
	({ className, showIcon = false, ...props }, ref) => {
		const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []);

		return (
			<div
				ref={ref}
				data-sidebar="menu-skeleton"
				className={cn('rounded-md h-8 flex gap-2 px-2 items-center', className)}
				{...props}
			>
				{showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
				<Skeleton
					className="h-4 flex-1 max-w-(--skeleton-width)"
					data-sidebar="menu-skeleton-text"
					style={{ '--skeleton-width': width } as React.CSSProperties}
				/>
			</div>
		);
	}
);
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';
