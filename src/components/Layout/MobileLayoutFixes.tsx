'use client';

import { useEffect, useState } from 'react';

export function MobileLayoutFixes() {
	const [isMobile, setIsMobile] = useState(false);
	const [navHeight, setNavHeight] = useState(80);

	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);

			// Calculate actual navigation height
			const bottomNav = document.getElementById('bottom-navigation');

			if (bottomNav) {
				const rect = bottomNav.getBoundingClientRect();
				// For bottom navigation, we use its height + distance from bottom
				setNavHeight(rect.height + 32);
			} else {
				// If no bottom navigation, reset to 0
				setNavHeight(0);
			}
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
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
