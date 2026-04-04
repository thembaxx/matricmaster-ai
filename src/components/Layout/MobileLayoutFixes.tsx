'use client';

import { useEffect, useRef, useState } from 'react';

export function MobileLayoutFixes() {
	const [isMobile, setIsMobile] = useState(false);
	const [navHeight, setNavHeight] = useState(80);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const checkMobile = () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}

			rafRef.current = requestAnimationFrame(() => {
				const mobile = window.innerWidth < 768;
				setIsMobile(mobile);

				const bottomNav = document.getElementById('bottom-navigation');

				if (bottomNav) {
					const rect = bottomNav.getBoundingClientRect();
					setNavHeight(rect.height + 32);
				} else {
					setNavHeight(0);
				}
			});
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => {
			window.removeEventListener('resize', checkMobile);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (isMobile) {
			// Set CSS custom properties for mobile layout
			document.documentElement.style.setProperty('--mobile-nav-height', `${navHeight}px`);
			document.documentElement.style.setProperty(
				'--mobile-safe-bottom-padding',
				navHeight > 0 ? `${navHeight + 16}px` : '120px'
			);
		} else {
			// Reset for desktop
			document.documentElement.style.setProperty('--mobile-nav-height', '0px');
			document.documentElement.style.setProperty('--mobile-safe-bottom-padding', '0px');
		}
	}, [isMobile, navHeight]);

	return null;
}
