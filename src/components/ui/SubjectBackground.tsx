'use client';

import { domAnimation, LazyMotion } from 'framer-motion';
import { AnimatePresence, motion as m } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { getSubjectGradient } from '@/content';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { DURATION, EASING } from '@/lib/animation-presets';

interface SubjectBackgroundContextValue {
	subjectId: string | null;
	setSubjectId: (id: string | null) => void;
	gradient: { primary: string; secondary: string; accent: string };
}

const SubjectBackgroundContext = createContext<SubjectBackgroundContextValue | null>(null);

export function useSubjectBackground() {
	const context = useContext(SubjectBackgroundContext);
	if (!context) {
		throw new Error('useSubjectBackground must be used within SubjectBackgroundProvider');
	}
	return context;
}

interface SubjectBackgroundProviderProps {
	children: ReactNode;
	defaultIntensity?: number;
}

export function SubjectBackgroundProvider({
	children,
	defaultIntensity = 0.08,
}: SubjectBackgroundProviderProps) {
	const pathname = usePathname();
	const prefersReducedMotion = useReducedMotion();
	const [subjectId, setSubjectId] = useState<string | null>(null);
	const intensity = defaultIntensity;

	const detectedSubjectId = useMemo(() => {
		const match = pathname.match(/\/subjects\/([^/]+)/);
		return match?.[1] ?? null;
	}, [pathname]);

	const gradient = useMemo(() => {
		const id = detectedSubjectId;
		return id
			? getSubjectGradient(id)
			: {
					primary: '#667eea',
					secondary: '#764ba2',
					accent: '#a855f7',
				};
	}, [detectedSubjectId]);

	const value: SubjectBackgroundContextValue = {
		subjectId: detectedSubjectId,
		setSubjectId,
		gradient,
	};

	return (
		<SubjectBackgroundContext.Provider value={value}>
			<LazyMotion features={domAnimation}>
				{/* Background gradient layer */}
				<AnimatePresence>
					{subjectId && detectedSubjectId && (
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: DURATION.slow, ease: EASING.easeOut }}
							className="fixed inset-0 -z-10 pointer-events-none"
							style={{
								background: `linear-gradient(135deg, ${gradient.primary}, ${gradient.secondary})`,
								opacity: prefersReducedMotion ? 0 : intensity,
							}}
						>
							{!prefersReducedMotion && (
								<div
									className="absolute inset-0 animate-gradient-shimmer"
									style={{
										background:
											'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
									}}
								/>
							)}
						</m.div>
					)}
				</AnimatePresence>
			</LazyMotion>
			{children}
		</SubjectBackgroundContext.Provider>
	);
}
