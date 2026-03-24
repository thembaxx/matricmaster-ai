'use client';

import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from './sidebar-constants';
import { SidebarContext, useSidebarState } from './use-sidebar';

type SidebarProviderProps = React.ComponentProps<'div'> & {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
	(
		{
			defaultOpen = true,
			open: openProp,
			onOpenChange: setOpenProp,
			className,
			style,
			children,
			...props
		},
		ref
	) => {
		const contextValue = useSidebarState(defaultOpen, openProp, setOpenProp);

		return (
			<SidebarContext.Provider value={contextValue}>
				<TooltipProvider delayDuration={0}>
					<div
						style={
							{
								'--sidebar-width': SIDEBAR_WIDTH,
								'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
								...style,
							} as React.CSSProperties
						}
						className={cn(
							'group/sidebar-wrapper sm:flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
							className
						)}
						ref={ref}
						{...props}
					>
						{children}
					</div>
				</TooltipProvider>
			</SidebarContext.Provider>
		);
	}
);
SidebarProvider.displayName = 'SidebarProvider';
