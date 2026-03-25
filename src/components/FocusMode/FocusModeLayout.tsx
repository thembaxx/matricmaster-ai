'use client';

import { LogoutIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useFocusModeContext } from '@/contexts/FocusModeContext';
import { cn } from '@/lib/utils';
import { ExamCompleteScreen } from './ExamCompleteScreen';
import { ExamTimerBar } from './ExamTimerBar';

interface FocusModeLayoutProps {
	children: ReactNode;
}

export function FocusModeLayout({ children }: FocusModeLayoutProps) {
	const { isActive, isCompleted, exitExam } = useFocusModeContext();

	if (!isActive && !isCompleted) {
		return <>{children}</>;
	}

	return (
		<>
			{isActive && <ExamTimerBar />}

			{isActive && (
				<div
					className={cn(
						'fixed inset-0 z-[99] bg-background overflow-auto',
						'transition-all duration-300'
					)}
					style={{ paddingTop: '48px' }}
				>
					<div className="relative min-h-full">
						{children}

						<div className="fixed bottom-6 right-6 z-[101]">
							<Button
								variant="outline"
								size="sm"
								onClick={exitExam}
								className="rounded-full h-10 px-4 gap-2 bg-card/80 backdrop-blur-md border border-border/50 shadow-lg text-[10px] font-bold tracking-widest text-muted-foreground hover:text-foreground"
							>
								<HugeiconsIcon icon={LogoutIcon} className="w-3.5 h-3.5" />
								exit focus mode
							</Button>
						</div>
					</div>
				</div>
			)}

			{isCompleted && (
				<div className="fixed inset-0 z-[200] bg-background">
					<ExamCompleteScreen />
				</div>
			)}
		</>
	);
}
