'use client';

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

type FocusModeState = 'inactive' | 'active' | 'completed';

interface FocusModeContextType {
	state: FocusModeState;
	isFocusMode: boolean;
	startFocusMode: () => void;
	endFocusMode: () => void;
	completeExam: () => void;
}

const FocusModeContext = createContext<FocusModeContextType>({
	state: 'inactive',
	isFocusMode: false,
	startFocusMode: () => {},
	endFocusMode: () => {},
	completeExam: () => {},
});

export function FocusModeProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<FocusModeState>('inactive');

	const startFocusMode = useCallback(() => {
		setState('active');
	}, []);

	const endFocusMode = useCallback(() => {
		setState('inactive');
	}, []);

	const completeExam = useCallback(() => {
		setState('completed');
	}, []);

	return (
		<FocusModeContext.Provider
			value={{
				state,
				isFocusMode: state === 'active',
				startFocusMode,
				endFocusMode,
				completeExam,
			}}
		>
			{children}
		</FocusModeContext.Provider>
	);
}

export const useFocusMode = () => useContext(FocusModeContext);
