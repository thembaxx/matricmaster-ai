'use client';

import { RefreshIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MistakeBankProps {
	initialCount?: number;
}

export function MistakeBank({ initialCount = 0 }: MistakeBankProps) {
	const router = useRouter();
	const count = initialCount;

	const handleRevisit = () => {
		router.push('/quiz?mode=mistakes');
	};

	if (count === 0) {
		return (
			<Card className="rounded-[2rem] border-border/50 shadow-tiimo overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
				<CardHeader className="p-6 pb-0">
					<CardTitle className="text-xs font-semibold text-emerald-600 flex items-center gap-2">
						<HugeiconsIcon icon={RefreshIcon} className="w-4 h-4" />
						Mistake Bank
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<div className="flex flex-col items-center justify-center py-4 text-center">
						<div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
							<span className="text-3xl">🎉</span>
						</div>
						<h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400">All Clear!</h4>
						<p className="text-xs text-muted-foreground mt-1">No mistakes to review</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="rounded-[2rem] border-border/50 shadow-tiimo overflow-hidden bg-gradient-to-br from-rose-500/10 to-rose-600/5">
			<CardHeader className="p-6 pb-0">
				<CardTitle className="text-xs font-semibold  tracking-wider text-rose-600 flex items-center gap-2">
					<HugeiconsIcon icon={RefreshIcon} className="w-4 h-4" />
					Mistake Bank
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<m.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="text-4xl font-bold text-rose-600"
						>
							{count}
						</m.div>
						<p className="text-xs text-muted-foreground font-medium">
							{count === 1 ? 'mistake' : 'mistakes'} to review
						</p>
					</div>
					<div className="text-right">
						<div className="text-lg">📝</div>
					</div>
				</div>

				<Button
					onClick={handleRevisit}
					className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold  tracking-wider text-xs h-11 rounded-xl shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
				>
					<HugeiconsIcon icon={RefreshIcon} className="w-4 h-4 mr-2" />
					Revisit Mistakes
				</Button>
			</CardContent>
		</Card>
	);
}
