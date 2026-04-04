'use client';

import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface QuizTopBarProps {
	mode: 'test' | 'practice';
	currentSubject: string;
	onModeChange: (mode: 'test' | 'practice') => void;
	onSubjectClick: () => void;
}

export function QuizTopBar({
	mode,
	currentSubject,
	onModeChange,
	onSubjectClick,
}: QuizTopBarProps) {
	const router = useRouter();

	return (
		<div className="flex items-center justify-between mb-6">
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full"
				onClick={() => router.push('/dashboard')}
				aria-label="Go back"
			>
				<HugeiconsIcon icon={ArrowLeft02Icon} className="w-6 h-6" />
			</Button>
			<div className="flex gap-2">
				<Button
					variant={mode === 'test' ? 'default' : 'outline'}
					size="sm"
					className="rounded-full"
					onClick={() => onModeChange('test')}
				>
					Test
				</Button>
				<Button
					variant={mode === 'practice' ? 'default' : 'outline'}
					size="sm"
					className="rounded-full"
					onClick={() => onModeChange('practice')}
				>
					Practice
				</Button>
			</div>
			<Button variant="ghost" size="sm" className="rounded-full" onClick={onSubjectClick}>
				{currentSubject}
			</Button>
		</div>
	);
}
