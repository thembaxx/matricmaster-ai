'use client';

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
	const pointsToGoal = targetAps - currentAps;

	return (
		<Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Target className="w-5 h-5" />
					APS Progress
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="text-center">
						<div className="text-4xl font-bold">{currentAps}</div>
						<div className="text-sm text-white/70">
							of {targetAps} target
							{universityTarget && ` (${universityTarget})`}
						</div>
					</div>

					<Progress value={progressPercent} className="h-3 bg-white/20" />

					<div className="flex justify-between text-sm">
						<span>{progressPercent.toFixed(0)}%</span>
						<span>{pointsToGoal} points to go</span>
					</div>

					<div className="pt-3 border-t border-white/20">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Award className="w-4 h-4 text-yellow-300" />
								<span className="text-sm">This Month</span>
							</div>
							<span className="font-bold text-lg">+{pointsThisMonth}</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
