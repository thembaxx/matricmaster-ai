'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { useFocusMode } from '@/contexts/FocusModeContext';

interface FocusLayoutProps {
	children: React.ReactNode;
	timeRemaining: number;
	totalTime: number;
}

export function FocusLayout({ children, timeRemaining, totalTime }: FocusLayoutProps) {
	const { endFocusMode, state } = useFocusMode();

	const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
	const isLowTime = timeRemaining < 600;

	const handleExit = () => {
		endFocusMode();
	};

	if (state !== 'active') return null;

	return (
		<div className="fixed inset-0 z-[100] bg-background">
			<div className="fixed top-0 left-0 right-0 h-12 bg-secondary flex items-center px-4 gap-4">
				<div className="flex-1 h-2 bg-primary/20 rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-1000 ${
							isLowTime ? 'bg-red-500' : 'bg-primary'
						}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
				<span className={`font-mono text-lg ${isLowTime ? 'text-red-500' : ''}`}>
					{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
				</span>
				<Button variant="ghost" size="sm" onClick={handleExit}>
					<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1" />
					Exit
				</Button>
			</div>

			<div className="pt-12 h-full overflow-auto">{children}</div>
		</div>
	);
}
