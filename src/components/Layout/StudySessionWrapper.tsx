'use client';

import type { ReactNode } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { FocusContent } from './FocusContent';
import { TimelineSidebar } from './TimelineSidebar';

interface StudySessionWrapperProps {
	children: ReactNode;
	showTimeline?: boolean;
}

export function StudySessionWrapper({ children, showTimeline = true }: StudySessionWrapperProps) {
	return (
		<div className="flex min-h-screen bg-background">
			{showTimeline && <TimelineSidebar />}
			<FocusContent showTimeline={showTimeline}>{children}</FocusContent>
			<ContextualAIBubble />
		</div>
	);
}
