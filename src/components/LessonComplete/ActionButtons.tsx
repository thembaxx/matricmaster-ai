'use client';

import {
	ArrowRight01Icon,
	ChartBar,
	Layers01Icon,
	Refresh01Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
	onShowAnalytics: () => void;
}

export const ActionButtons = memo(function ActionButtons({ onShowAnalytics }: ActionButtonsProps) {
	const router = useRouter();

	return (
		<div className="w-full max-w-md space-y-4">
			<Button
				variant="gradient"
				className="w-full h-16 rounded-3xl text-lg font-black shadow-2xl transition-all flex items-center justify-center gap-2"
				onClick={() => router.push('/dashboard')}
			>
				Keep Going
				<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
			</Button>
			<Button
				variant="ghost"
				className="w-full h-14 rounded-2xl font-black text-sm  tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
				onClick={onShowAnalytics}
			>
				<HugeiconsIcon icon={ChartBar} className="w-5 h-5" />
				View Analytics
			</Button>
			<Button
				variant="ghost"
				className="w-full h-14 rounded-2xl font-black text-sm  tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
				onClick={() => router.push('/quiz')}
			>
				<HugeiconsIcon icon={Refresh01Icon} className="w-5 h-5" />
				Try Another Quiz
			</Button>
			<Button
				variant="ghost"
				className="w-full h-14 rounded-2xl font-black text-sm  tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
				onClick={() => router.push('/flashcards')}
			>
				<HugeiconsIcon icon={Layers01Icon} className="w-5 h-5" />
				Review Flashcards
			</Button>
			<Button
				variant="ghost"
				className="w-full h-14 rounded-2xl font-black text-sm  tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
				onClick={() => router.push('/past-papers')}
			>
				<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
				Practice Past Papers
			</Button>
		</div>
	);
});
