'use client';

import { useEffect, useRef, useState } from 'react';

export function MobileLayoutFixes() {
	const [isMobile, setIsMobile] = useState(false);
	const [navHeight, setNavHeight] = useState(80);
	const rafRef = useRef<number | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		const checkMobile = () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}

			rafRef.current = requestAnimationFrame(() => {
				const mobile = window.innerWidth < 768;
				setIsMobile(mobile);
			});
		};

		const updateNavHeight = () => {
			const bottomNav = document.getElementById('bottom-navigation');
			if (bottomNav) {
				const rect = bottomNav.getBoundingClientRect();
				setNavHeight(rect.height + 32);
			} else {
				setNavHeight(0);
			}
		};

		const setupResizeObserver = () => {
			const bottomNav = document.getElementById('bottom-navigation');
			if (bottomNav && window.ResizeObserver) {
				resizeObserverRef.current = new ResizeObserver(updateNavHeight);
				resizeObserverRef.current.observe(bottomNav);
			}
		};

		checkMobile();
		updateNavHeight();
		setupResizeObserver();

		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
			}
		};
	}, []);

	useEffect(() => {
		if (isMobile) {
			// Set CSS custom properties for mobile layout
			document.documentElement.style.setProperty('--mobile-nav-height', `${navHeight}px`);
			document.documentElement.style.setProperty(
				'--mobile-safe-bottom-padding',
				navHeight > 0 ? `${navHeight + 16}px` : '160px'
			);
		} else {
			// Reset for desktop
			document.documentElement.style.setProperty('--mobile-nav-height', '0px');
			document.documentElement.style.setProperty('--mobile-safe-bottom-padding', '0px');
		}
	}, [isMobile, navHeight]);

	return null;
}
