'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { useConfetti } from '@/hooks/useConfetti';
import { Confetti } from './Confetti';

interface ConfettiContextValue {
	trigger: (
		type: Parameters<ReturnType<typeof useConfetti>['trigger']>[0],
		colors?: string[]
	) => void;
	stop: () => void;
}

const ConfettiContext = createContext<ConfettiContextValue | null>(null);

export function ConfettiProvider({ children }: { children: ReactNode }) {
	const { active, config, trigger, stop, getConfig } = useConfetti();
	const confettiConfig = getConfig(config.type);

	return (
		<ConfettiContext.Provider value={{ trigger, stop }}>
			<Confetti
				active={active}
				colors={config.colors && config.colors.length > 0 ? config.colors : undefined}
				particleCount={confettiConfig.particleCount}
				duration={confettiConfig.duration}
				onComplete={stop}
			/>
			{children}
		</ConfettiContext.Provider>
	);
}

export function useConfettiContext() {
	const context = useContext(ConfettiContext);
	if (!context) {
		throw new Error('useConfettiContext must be used within ConfettiProvider');
	}
	return context;
}
