'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
	SIDEBAR_COOKIE_MAX_AGE,
	SIDEBAR_COOKIE_NAME,
	SIDEBAR_KEYBOARD_SHORTCUT,
	setCookie,
} from './sidebar-constants';

export type SidebarContext = {
	state: 'expanded' | 'collapsed';
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
};

export const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.');
	}
	return context;
}

export function useSidebarState(
	defaultOpen: boolean,
	openProp?: boolean,
	setOpenProp?: (open: boolean) => void
) {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = React.useState(false);

	const [_open, _setOpen] = React.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = React.useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === 'function' ? value(open) : value;
			if (setOpenProp) {
				setOpenProp(openState);
			} else {
				_setOpen(openState);
			}
			setCookie(SIDEBAR_COOKIE_NAME, String(openState), SIDEBAR_COOKIE_MAX_AGE);
		},
		[setOpenProp, open]
	);

	const toggleSidebar = React.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [isMobile, setOpen]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [toggleSidebar]);

	const state = open ? 'expanded' : 'collapsed';

	const contextValue = React.useMemo<SidebarContext>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar,
		}),
		[state, open, setOpen, isMobile, openMobile, toggleSidebar]
	);

	return contextValue;
}
