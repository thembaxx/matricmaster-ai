'use client';

import { useEffect } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useSession } from '@/lib/auth-client';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();
	const accessibility = useAccessibility(session?.user?.id as string | undefined);
	const { settings, textSizeMultiplier, colorBlindFilter } = accessibility;

	useEffect(() => {
		const root = document.documentElement;

		root.style.setProperty('--accessibility-text-scale', String(textSizeMultiplier));

		if (settings.highContrast) {
			root.classList.add('high-contrast');
		} else {
			root.classList.remove('high-contrast');
		}

		if (settings.reducedMotion) {
			root.classList.add('reduced-motion');
		} else {
			root.classList.remove('reduced-motion');
		}

		if (settings.largerTargets) {
			root.classList.add('larger-targets');
		} else {
			root.classList.remove('larger-targets');
		}

		if (settings.focusIndicators) {
			root.classList.add('enhanced-focus');
		} else {
			root.classList.remove('enhanced-focus');
		}

		if (settings.keyboardNavigation) {
			root.classList.add('keyboard-navigation');
		} else {
			root.classList.remove('keyboard-navigation');
		}

		if (colorBlindFilter !== 'none') {
			root.style.setProperty('--color-blind-filter', colorBlindFilter);
		} else {
			root.style.removeProperty('--color-blind-filter');
		}
	}, [settings, textSizeMultiplier, colorBlindFilter]);

	return (
		<>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				style={{ display: 'none' }}
				aria-label="Color blindness filters"
			>
				<defs>
					<filter id="protanopia-filter">
						<feColorMatrix
							type="matrix"
							values="0.567, 0.433, 0, 0, 0
									0.558, 0.442, 0, 0, 0
									0, 0.242, 0.758, 0, 0
									0, 0, 0, 1, 0"
						/>
					</filter>
					<filter id="deuteranopia-filter">
						<feColorMatrix
							type="matrix"
							values="0.625, 0.375, 0, 0, 0
									0.7, 0.3, 0, 0, 0
									0, 0.3, 0.7, 0, 0
									0, 0, 0, 1, 0"
						/>
					</filter>
					<filter id="tritanopia-filter">
						<feColorMatrix
							type="matrix"
							values="0.95, 0.05, 0, 0, 0
									0, 0.433, 0.567, 0, 0
									0, 0.475, 0.525, 0, 0
									0, 0, 0, 1, 0"
						/>
					</filter>
				</defs>
			</svg>
			{children}
		</>
	);
}
