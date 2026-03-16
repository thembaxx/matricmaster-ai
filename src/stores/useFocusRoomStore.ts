import { create } from 'zustand';

interface FocusRoomState {
	isActive: boolean;
	isGroupMode: boolean;
	timeLeft: number;
	focusMinutes: number;
	setIsActive: (active: boolean) => void;
	setIsGroupMode: (mode: boolean) => void;
	setTimeLeft: (time: number) => void;
	setFocusMinutes: (minutes: number) => void;
	tick: () => void;
	reset: () => void;
}

export const useFocusRoomStore = create<FocusRoomState>((set) => ({
	isActive: false,
	isGroupMode: false,
	timeLeft: 25 * 60,
	focusMinutes: 0,
	setIsActive: (active) => set({ isActive: active }),
	setIsGroupMode: (mode) => set({ isGroupMode: mode }),
	setTimeLeft: (time) => set({ timeLeft: time }),
	setFocusMinutes: (minutes) => set({ focusMinutes: minutes }),
	tick: () =>
		set((state) => {
			if (state.timeLeft > 0) {
				return { timeLeft: state.timeLeft - 1 };
			}
			return {};
		}),
	reset: () => set({ isActive: false, timeLeft: 25 * 60 }),
}));
