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
			const nav = document.querySelector('.ios-glass');
			if (nav) {
				const rect = nav.getBoundingClientRect();
				setNavHeight(rect.height);
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
				`${navHeight + 32}px`
			);
		} else {
			// Reset for desktop
			document.documentElement.style.setProperty('--mobile-nav-height', '0px');
			document.documentElement.style.setProperty('--mobile-safe-bottom-padding', '0px');
		}
	}, [isMobile, navHeight]);

	return null;
}