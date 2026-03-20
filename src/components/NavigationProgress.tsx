'use client';

import { useCallback, useEffect, useState } from 'react';

export function NavigationProgress() {
	const [isNavigating, setIsNavigating] = useState(false);
	const [progress, setProgress] = useState(0);

	const startNavigation = useCallback(() => {
		setIsNavigating(true);
		setProgress(0);
	}, []);

	const endNavigation = useCallback(() => {
		setProgress(100);
		setTimeout(() => {
			setIsNavigating(false);
			setProgress(0);
		}, 200);
	}, []);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const anchor = target.closest('a');
			if (
				anchor?.href &&
				!anchor.href.startsWith('#') &&
				!anchor.href.startsWith('mailto:') &&
				!anchor.href.startsWith('tel:') &&
				anchor.target !== '_blank'
			) {
				const href = anchor.href;
				const currentUrl = window.location.href;
				if (href !== currentUrl && !href.startsWith(`${currentUrl}#`)) {
					startNavigation();
				}
			}
		};

		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	}, [startNavigation]);

	useEffect(() => {
		setIsNavigating(false);
		setProgress(0);
	}, []);

	useEffect(() => {
		if (!isNavigating) return;

		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 90) {
					clearInterval(interval);
					return prev;
				}
				return prev + Math.random() * 15;
			});
		}, 150);

		return () => clearInterval(interval);
	}, [isNavigating]);

	useEffect(() => {
		if (isNavigating) {
			const timer = setTimeout(() => {
				endNavigation();
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [isNavigating, endNavigation]);

	return (
		<div
			className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
			role="progressbar"
			aria-valuenow={Math.round(progress)}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				className="h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 ease-out shadow-sm"
				style={{
					width: `${progress}%`,
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
				}}
			/>
		</div>
	);
}
