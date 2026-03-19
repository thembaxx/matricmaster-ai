'use client';

import { useAiContextStore } from '@/stores/useAiContextStore';

export function useAiContext() {
	const context = useAiContextStore((s) => s.context);
	const setContext = useAiContextStore((s) => s.setContext);
	const clearContext = useAiContextStore((s) => s.clearContext);
	const pushToHistory = useAiContextStore((s) => s.pushToHistory);
	const addActivity = useAiContextStore((s) => s.addActivity);

	return {
		context,
		setContext,
		clearContext,
		pushToHistory,
		addActivity,
	};
}
