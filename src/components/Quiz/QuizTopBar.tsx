'use client';

import { ArrowLeft02Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface QuizTopBarProps {
	mode: 'test' | 'practice';
	currentSubject: string;
	onModeChange: (mode: 'test' | 'practice') => void;
	onSubjectClick: () => void;
}

export function QuizTopBar({ mode, onModeChange, onSubjectClick }: QuizTopBarProps) {
	const router = useRouter();
	const [isPillActive, setIsPillActive] = useState<'test' | 'practice'>(mode);

	return (
		<div className="flex items-center justify-between px-1 py-1.5 bg-muted/30 rounded-full">
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full w-10 h-10"
				onClick={() => router.back()}
				aria-label="Go back"
			>
				<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
			</Button>

			<div className="flex items-center gap-1 p-1 bg-background/80 rounded-full shadow-sm">
				<motion.button
					onClick={() => {
						setIsPillActive('test');
						onModeChange('test');
					}}
					className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
						isPillActive === 'test'
							? 'text-foreground'
							: 'text-muted-foreground/60 hover:text-foreground'
					}`}
					whileTap={{ scale: 0.95 }}
				>
					{isPillActive === 'test' && (
						<motion.div
							layoutId="modePill"
							className="absolute inset-0 bg-muted/50 rounded-full"
							transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
						/>
					)}
					<span className="relative z-10">test</span>
				</motion.button>
				<motion.button
					onClick={() => {
						setIsPillActive('practice');
						onModeChange('practice');
					}}
					className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
						isPillActive === 'practice'
							? 'text-foreground'
							: 'text-muted-foreground/60 hover:text-foreground'
					}`}
					whileTap={{ scale: 0.95 }}
				>
					{isPillActive === 'practice' && (
						<motion.div
							layoutId="modePill"
							className="absolute inset-0 bg-muted/50 rounded-full"
							transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
						/>
					)}
					<span className="relative z-10">practice</span>
				</motion.button>
			</div>

			<Button
				variant="ghost"
				size="icon"
				className="rounded-full w-10 h-10"
				onClick={onSubjectClick}
				aria-label="Subject settings"
			>
				<HugeiconsIcon icon={Settings02Icon} className="w-5 h-5" />
			</Button>
		</div>
	);
}
