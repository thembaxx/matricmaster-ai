'use client';

import { Mortarboard01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TrendingUp } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { useGoalStore } from '@/stores/useGoalStore';

export function UniversityGoalCard() {
	const router = useRouter();
	const goal = useGoalStore((state) => state.goal);

	const universityName = goal?.universityName || 'Set a Goal';
	const faculty = goal?.faculty || 'Go to APS Calculator';
	const currentAps = goal?.currentAps || 0;
	const targetAps = goal?.targetAps || 42;

	const progress = Math.min((currentAps / targetAps) * 100, 100);
	const pointsNeeded = Math.max(targetAps - currentAps, 0);

	if (!goal) {
		return (
			<m.div
				whileHover={{ scale: 1.01 }}
				whileTap={{ scale: 0.99 }}
				onClick={() => router.push('/aps-calculator')}
				className="tiimo-card p-6 flex flex-col gap-4 relative overflow-hidden cursor-pointer"
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
							<HugeiconsIcon icon={Mortarboard01Icon} className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-sm font-bold text-foreground">University Goal</h3>
							<p className="text-[10px] text-tiimo-gray-muted font-bold  tracking-widest">
								Not Set
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2 mt-2 p-3 bg-secondary/50 rounded-2xl border border-dashed border-border">
					<p className="text-[11px] font-medium text-muted-foreground">
						Calculate your APS and set a university goal to see it here.
					</p>
				</div>
			</m.div>
		);
	}

	return (
		<m.div
			whileHover={{ scale: 1.01 }}
			whileTap={{ scale: 0.99 }}
			onClick={() => router.push('/aps-calculator')}
			className="tiimo-card p-6 flex flex-col gap-4 relative overflow-hidden cursor-pointer"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
						<HugeiconsIcon icon={Mortarboard01Icon} className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-sm font-black text-foreground">{universityName}</h3>
						<p className="text-[10px] text-tiimo-gray-muted font-bold  tracking-widest">
							{faculty}
						</p>
					</div>
				</div>
				<div className="text-right">
					<span className="text-2xl font-black text-primary">{currentAps}</span>
					<span className="text-sm font-bold text-tiimo-gray-muted"> / {targetAps}</span>
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between text-[10px] font-black  tracking-widest">
					<span className="text-tiimo-gray-muted">Your Progress</span>
					<span className="text-primary">{Math.round(progress)}%</span>
				</div>
				<Progress value={progress} className="h-2 bg-secondary" />
			</div>

			{pointsNeeded > 0 ? (
				<div className="flex items-center gap-2 mt-2 p-3 bg-tiimo-lavender/5 rounded-2xl border border-tiimo-lavender/10">
					<TrendingUp className="w-4 h-4 text-tiimo-lavender" />
					<p className="text-[11px] font-medium text-foreground">
						You need{' '}
						<span className="font-black text-tiimo-lavender">{pointsNeeded} more points</span> to
						reach your goal.
					</p>
				</div>
			) : (
				<div className="flex items-center gap-2 mt-2 p-3 bg-tiimo-green/5 rounded-2xl border border-tiimo-green/10">
					<TrendingUp className="w-4 h-4 text-tiimo-green" />
					<p className="text-[11px] font-medium text-foreground">
						Goal reached! You are <span className="font-black text-tiimo-green">eligible</span> for
						this program.
					</p>
				</div>
			)}
		</m.div>
	);
}
