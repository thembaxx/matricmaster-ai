'use client';

import { m } from 'framer-motion';
import { Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface APSProgressCardProps {
	currentAps: number;
	targetAps: number;
	pointsThisMonth: number;
	universityTarget?: string;
}

export function APSProgressCard({
	currentAps,
	targetAps,
	pointsThisMonth,
	universityTarget,
}: APSProgressCardProps) {
	const progressPercent = Math.min((currentAps / targetAps) * 100, 100);
	const pointsToGoal = Math.max(0, targetAps - currentAps);
	const isOnTrack = progressPercent >= 50;

	return (
		<Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white overflow-hidden relative">
			<div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
			<div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

			<CardHeader className="pb-2 relative z-10">
				<CardTitle className="flex items-center gap-2 text-base">
					<m.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }}>
						<Target className="w-5 h-5" />
					</m.div>
					<span className="font-bold">APS Progress</span>
				</CardTitle>
			</CardHeader>

			<CardContent className="relative z-10">
				<div className="space-y-4">
					<m.div
						className="text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<m.div
							className="text-5xl font-black tracking-tight"
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							{currentAps}
						</m.div>
						<div className="text-sm text-white/80 mt-1 font-medium">
							of <span className="font-bold">{targetAps}</span> target
							{universityTarget && (
								<span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
									{universityTarget}
								</span>
							)}
						</div>
					</m.div>

					<m.div
						initial={{ opacity: 0, scaleX: 0 }}
						animate={{ opacity: 1, scaleX: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<Progress
							value={progressPercent}
							className="h-3 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-yellow-300 [&>div]:to-amber-400"
						/>
					</m.div>

					<div className="flex justify-between text-sm">
						<m.span
							className="font-semibold"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							{progressPercent.toFixed(0)}%
						</m.span>
						<m.span
							className={`font-medium ${isOnTrack ? 'text-emerald-200' : 'text-white/70'}`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.35 }}
						>
							{pointsToGoal > 0 ? `${pointsToGoal} points to go` : 'Goal reached!'}
						</m.span>
					</div>

					<m.div
						className="pt-4 border-t border-white/20"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<m.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
								>
									<Award className="w-5 h-5 text-yellow-300" />
								</m.div>
								<span className="text-sm font-medium text-white/90">This Month</span>
							</div>
							<m.span
								className="font-bold text-xl tabular-nums"
								initial={{ opacity: 0, x: 10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5 }}
							>
								+{pointsThisMonth}
							</m.span>
						</div>
					</m.div>
				</div>
			</CardContent>
		</Card>
	);
}
