'use client';

import { ArrowRight01Icon, CheckmarkCircle02Icon, Home01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useFocusModeContext } from '@/contexts/FocusModeContext';

export function ExamCompleteScreen() {
	const router = useRouter();
	const { config, totalTime, timeRemaining, violations, resetExam, status } = useFocusModeContext();

	if (status !== 'completed') return null;

	const timeUsed = totalTime - timeRemaining;
	const mins = Math.floor(timeUsed / 60);
	const secs = timeUsed % 60;

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-lg"
		>
			<m.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ delay: 0.1, type: 'spring', damping: 25 }}
				className="max-w-md w-full mx-4 text-center"
			>
				<div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
					<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-10 h-10 text-success" />
				</div>

				<h1 className="text-3xl font-black tracking-tighter mb-2">time&apos;s up</h1>
				<p className="text-sm font-bold text-muted-foreground tracking-widest mb-8">
					{config?.paperTitle || 'exam session'} complete
				</p>

				<div className="grid grid-cols-2 gap-3 mb-8">
					<div className="bg-card border border-border/50 rounded-2xl p-4">
						<p className="text-[10px] font-bold text-muted-foreground tracking-widest mb-1">
							time used
						</p>
						<p className="text-xl font-black font-mono tracking-tight">
							{mins}:{secs.toString().padStart(2, '0')}
						</p>
					</div>
					<div className="bg-card border border-border/50 rounded-2xl p-4">
						<p className="text-[10px] font-bold text-muted-foreground tracking-widest mb-1">
							violations
						</p>
						<p className="text-xl font-black font-mono tracking-tight">{violations}</p>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<Button
						size="lg"
						onClick={() => {
							resetExam();
							router.push('/dashboard');
						}}
						className="rounded-full h-14 font-black text-xs tracking-widest gap-2 shadow-xl shadow-primary/20"
					>
						<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
						review answers
					</Button>

					<Button
						variant="ghost"
						size="lg"
						onClick={() => {
							resetExam();
							router.push('/dashboard');
						}}
						className="rounded-full h-12 font-bold text-xs tracking-widest gap-2 text-muted-foreground"
					>
						<HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
						back to dashboard
					</Button>
				</div>
			</m.div>
		</m.div>
	);
}
