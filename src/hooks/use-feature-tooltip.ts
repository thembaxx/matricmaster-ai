'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'matricmaster-feature-tooltips-seen';

interface SeenTooltips {
	[key: string]: boolean;
}

export function useFeatureTooltip(featureId: string) {
	const [hasSeen, setHasSeen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const seen: SeenTooltips = JSON.parse(stored);
			setHasSeen(seen[featureId] ?? false);
		}
	}, [featureId]);

	const markAsSeen = useCallback(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		const seen: SeenTooltips = stored ? JSON.parse(stored) : {};
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
