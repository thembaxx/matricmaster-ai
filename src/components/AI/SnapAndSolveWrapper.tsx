'use client';

import type { ReactNode } from 'react';
import { AIErrorBoundary } from '@/components/AI/AIErrorBoundary';

interface SnapAndSolveWrapperProps {
	children: ReactNode;
}

export function SnapAndSolveWrapper({ children }: SnapAndSolveWrapperProps): ReactNode {
	return <AIErrorBoundary componentName="Snap & Solve">{children}</AIErrorBoundary>;
}
