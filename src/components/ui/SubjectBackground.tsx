'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { getSubjectGradient } from '@/constants/subjects';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

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
	const [intensity] = useState(defaultIntensity);
	const [gradient, setGradient] = useState({
		primary: '#667eea',
		secondary: '#764ba2',
		accent: '#a855f7',
	});

	// Detect subject from pathname
	useEffect(() => {
		const match = pathname.match(/\/subjects\/([^/]+)/);
		if (match?.[1]) {
			setSubjectId(match[1]);
		} else {
			setSubjectId(null);
		}
	}, [pathname]);

	// Update gradient when subject changes
	useEffect(() => {
		const newGradient = subjectId
			? getSubjectGradient(subjectId)
			: {
					primary: '#667eea',
					secondary: '#764ba2',
					accent: '#a855f7',
				};
		setGradient(newGradient);
	}, [subjectId]);

	const value: SubjectBackgroundContextValue = {
		subjectId,
		setSubjectId,
		gradient,
	};

	return (
		<SubjectBackgroundContext.Provider value={value}>
			{/* Background gradient layer */}
			<AnimatePresence>
				{subjectId && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5 }}
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
					</motion.div>
				)}
			</AnimatePresence>
			{children}
		</SubjectBackgroundContext.Provider>
	);
}
