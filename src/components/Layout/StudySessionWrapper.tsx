'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ContextualAIBubble } from '@/components/AI/ContextualAIBubble';
import { useAiContext } from '@/hooks/useAiContext';
import { FocusContent } from './FocusContent';
import { TimelineSidebar } from './TimelineSidebar';
import { UtilityDrawer } from './UtilityDrawer';

interface StudySessionWrapperProps {
	children: ReactNode;
	showTimeline?: boolean;
}

export function StudySessionWrapper({ children, showTimeline = true }: StudySessionWrapperProps) {
	const [isUtilityOpen, setIsUtilityOpen] = useState(false);
	const { context } = useAiContext();

	return (
		<div className="flex min-h-screen bg-background">
			{showTimeline && <TimelineSidebar />}
			<FocusContent showTimeline={showTimeline}>{children}</FocusContent>
			<ContextualAIBubble />
			<UtilityDrawer
				isOpen={isUtilityOpen}
				setIsOpen={setIsUtilityOpen}
				subject={context?.subject}
			/>
		</div>
	);
}
