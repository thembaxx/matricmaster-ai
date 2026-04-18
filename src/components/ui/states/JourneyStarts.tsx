'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface JourneyStartsProps {
	actionLabel?: string;
	onAction?: () => void;
}

export function JourneyStarts({
	actionLabel = 'Take your first quiz!',
	onAction,
}: JourneyStartsProps) {
	const router = useRouter();

	return (
		<m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
			<Card className="p-8 text-center bg-secondary/30 border-none">
				<div className="w-20 h-20 bg-tiimo-lavender/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
					<HugeiconsIcon icon={SparklesIcon} className="w-10 h-10 text-tiimo-lavender" />
				</div>
				<h3 className="text-xl font-bold text-foreground mb-2">
					Your learning journey starts here
				</h3>
				<p className="text-muted-foreground mb-6">{actionLabel}</p>
				<Button onClick={onAction || (() => router.push('/subjects'))}>Browse Subjects</Button>
			</Card>
		</m.div>
	);
}
