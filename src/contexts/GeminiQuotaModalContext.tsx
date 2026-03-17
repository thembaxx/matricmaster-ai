'use client';

import { createContext, useCallback, useContext, useState } from 'react';

interface GeminiQuotaModalContextType {
	showQuotaModal: boolean;
	triggerQuotaError: () => void;
	hideQuotaModal: () => void;
	dismissCount: number;
}

const GeminiQuotaModalContext = createContext<GeminiQuotaModalContextType | null>(null);

export function GeminiQuotaModalProvider({ children }: { children: React.ReactNode }) {
	const [showQuotaModal, setShowQuotaModal] = useState(false);
	const [dismissCount, setDismissCount] = useState(0);

	const triggerQuotaError = useCallback(() => {
		setShowQuotaModal(true);
	}, []);

	const hideQuotaModal = useCallback(() => {
		setShowQuotaModal(false);
		setDismissCount((prev) => prev + 1);
	}, []);

	return (
		<GeminiQuotaModalContext.Provider
			value={{
				showQuotaModal,
				triggerQuotaError,
				hideQuotaModal,
				dismissCount,
			}}
		>
			{children}
		</GeminiQuotaModalContext.Provider>
	);
}

export function useGeminiQuotaModal() {
	const context = useContext(GeminiQuotaModalContext);
	if (!context) {
		throw new Error('useGeminiQuotaModal must be used within a GeminiQuotaModalProvider');
	}
	return context;
}
