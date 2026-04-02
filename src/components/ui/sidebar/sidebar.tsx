'use client';

import { LayoutLeftIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, VisuallyHidden } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { SIDEBAR_WIDTH_MOBILE } from './sidebar-constants';
import { useSidebar } from './use-sidebar';

type SidebarProps = React.ComponentProps<'div'> & {
	side?: 'left' | 'right';
	variant?: 'sidebar' | 'floating' | 'inset';
	collapsible?: 'offcanvas' | 'icon' | 'none';
};

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
	(
		{
			side = 'left',
			variant = 'sidebar',
			collapsible = 'offcanvas',
			className,
			children,
			...props
		},
		ref
	) => {
		const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

		if (collapsible === 'none') {
			return (
				<div
					className={cn(
						'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
						className
					)}
					ref={ref}
					{...props}
				>
					{children}
				</div>
			);
		}

		if (isMobile) {
			return (
				<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
					<SheetContent
						data-sidebar="sidebar"
						data-mobile="true"
						className="w-[80vw] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
						style={
							{
								'--sidebar-width': SIDEBAR_WIDTH_MOBILE,
							} as React.CSSProperties
						}
						side={side}
					>
						<SheetTitle>
							<VisuallyHidden>Sidebar</VisuallyHidden>
						</SheetTitle>
						<div className="flex h-full w-full flex-col">{children}</div>
					</SheetContent>
				</Sheet>
			);
		}

		return (
			<div
				ref={ref}
				className="group peer hidden md:block text-sidebar-foreground"
				data-state={state}
				data-collapsible={state === 'collapsed' ? collapsible : ''}
				data-variant={variant}
				data-side={side}
			>
				<div
					className={cn(
						'duration-200 relative h-svh w-(--sidebar-width) bg-transparent transition-[width] ease-linear',
						'group-data-[collapsible=offcanvas]:w-0',
						'group-data-[side=right]:rotate-180',
						'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
					)}
				/>
				<div
					className={cn(
						'duration-200 fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] ease-linear md:flex',
						side === 'left'
							? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
							: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
						'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
						className
					)}
					{...props}
				>
					<div
						data-sidebar="sidebar"
						className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
					>
						{children}
					</div>
				</div>
			</div>
		);
	}
);
Sidebar.displayName = 'Sidebar';

export const SidebarTrigger = React.forwardRef<
	React.ElementRef<typeof Button>,
	React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();

	return (
		<Button
			ref={ref}
			data-sidebar="trigger"
			variant="ghost"
			size="icon"
			className={cn('h-7 w-7', className)}
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			<HugeiconsIcon icon={LayoutLeftIcon} />
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	);
});
SidebarTrigger.displayName = 'SidebarTrigger';

export const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<'main'>>(
	({ className, ...props }, ref) => {
		return (
			<main
				ref={ref}
				className={cn(
					'relative flex min-h-svh flex-1 flex-col bg-background',
					'peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
					className
				)}
				{...props}
			/>
		);
	}
);
SidebarInset.displayName = 'SidebarInset';
