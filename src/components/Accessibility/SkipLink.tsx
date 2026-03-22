'use client';

import { useEffect, useState } from 'react';
import { useAccessibilityStore } from '@/services/accessibility-service';

export function SkipLink() {
	const settings = useAccessibilityStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !settings.skipLinks) return null;

	return (
		<button
			type="button"
			className="skip-link"
			onClick={() => {
				const main = document.getElementById('main-content');
				if (main) {
					main.focus();
					main.scrollIntoView({ behavior: 'smooth' });
				}
			}}
		>
			Skip to main content
		</button>
	);
}
