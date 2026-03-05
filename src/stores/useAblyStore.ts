import { create } from 'zustand';

interface AblyState {
	isReady: boolean;
	setIsReady: (isReady: boolean) => void;
}

export const useAblyStore = create<AblyState>((set) => ({
	isReady: false,
	setIsReady: (isReady) => set({ isReady }),
}));
