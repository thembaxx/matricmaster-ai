'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lumni-feature-tooltips-seen';

interface SeenTooltips {
	[key: string]: boolean;
}

export function useFeatureTooltip(featureId: string) {
	const [hasSeen, setHasSeen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const seen: SeenTooltips = JSON.parse(stored);
				setHasSeen(seen[featureId] ?? false);
			} catch (error) {
				console.warn('Failed to parse feature tooltips:', error);
				setHasSeen(false);
			}
		}
	}, [featureId]);

	const markAsSeen = useCallback(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		let seen: SeenTooltips = {};
		if (stored) {
			try {
				seen = JSON.parse(stored);
			} catch (error) {
				console.warn('Failed to parse feature tooltips:', error);
			}
		}
		seen[featureId] = true;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
		setHasSeen(true);
		setIsVisible(false);
	}, [featureId]);

	const showTooltip = useCallback(() => {
		if (!hasSeen) {
			setIsVisible(true);
		}
	}, [hasSeen]);

	const hideTooltip = useCallback(() => {
		setIsVisible(false);
	}, []);

	const dismissAndMarkSeen = useCallback(() => {
		markAsSeen();
	}, [markAsSeen]);

	return {
		hasSeen,
		isVisible,
		showTooltip,
		hideTooltip,
		dismissAndMarkSeen,
		markAsSeen,
	};
}

export function clearAllTooltips() {
	localStorage.removeItem(STORAGE_KEY);
}
