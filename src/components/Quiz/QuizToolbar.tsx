'use client';

import { Button } from '@/components/ui/button';

interface QuizToolbarProps {
	mode: 'test' | 'practice';
	currentSubject: string;
	onExit: () => void;
	onModeChange: (mode: 'test' | 'practice') => void;
	onShowSubjectSelector: () => void;
}

export function QuizToolbar({
	mode,
	currentSubject,
	onExit,
	onModeChange,
	onShowSubjectSelector,
}: QuizToolbarProps) {
	return (
		<div className="flex items-center justify-between mb-6">
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full"
				onClick={onExit}
				aria-label="Exit quiz"
			>
				<svg
					className="w-6 h-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
			</Button>
			<div className="flex gap-2">
				<Button
					variant={mode === 'test' ? 'default' : 'outline'}
					size="sm"
					className="rounded-full"
					onClick={() => onModeChange('test')}
				>
					test
				</Button>
				<Button
					variant={mode === 'practice' ? 'default' : 'outline'}
					size="sm"
					className="rounded-full"
					onClick={() => onModeChange('practice')}
				>
					practice
				</Button>
			</div>
			<Button variant="ghost" size="sm" className="rounded-full" onClick={onShowSubjectSelector}>
				{currentSubject.toLowerCase()}
			</Button>
		</div>
	);
}
