'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CohortComparisonProps {
	userAccuracy: number;
	cohortAverage: number;
	percentile: number;
}

export function CohortComparison({
	userAccuracy,
	cohortAverage,
	percentile,
}: CohortComparisonProps) {
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const isAboveAverage = userAccuracy >= cohortAverage;
	const difference = userAccuracy - cohortAverage;

	const data = [
		{ label: 'You', value: userAccuracy, fill: '#3B82F6' },
		{ label: 'Average', value: cohortAverage, fill: '#94A3B8' },
	];

	let percentileMessage: string;
	if (percentile >= 90) {
		percentileMessage = "You're in the top 10%! Outstanding work.";
	} else if (percentile >= 75) {
		percentileMessage = "You're in the top 25%! Keep pushing forward.";
	} else if (percentile >= 50) {
		percentileMessage = "You're above average. Great progress!";
	} else {
		percentileMessage = 'Keep studying - you are improving every day.';
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-bold">
					<TrendingUp className="w-5 h-5 text-primary" />
					How You Compare
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="h-24">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data} barSize={48} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
								<XAxis
									dataKey="label"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
									domain={[0, 100]}
									tickFormatter={(v) => `${v}%`}
								/>
								<ReferenceLine
									y={cohortAverage}
									stroke="#94A3B8"
									strokeDasharray="3 3"
									label={{
										value: `Avg ${cohortAverage}%`,
										position: 'right',
										fill: 'var(--muted-foreground)',
										fontSize: 10,
									}}
								/>
								<Bar
									dataKey="value"
									radius={[8, 8, 0, 0]}
									animationDuration={prefersReducedMotion ? 0 : 800}
								>
									{data.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.fill} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>

					<div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
						<div>
							<p className="text-sm font-medium">Your accuracy</p>
							<p className="text-2xl font-bold font-numeric text-primary">{userAccuracy}%</p>
						</div>
						<div className="text-right">
							<p className="text-sm font-medium">Percentile</p>
							<p className="text-2xl font-bold font-numeric">
								{percentile}
								<span className="text-base text-muted-foreground">%</span>
							</p>
						</div>
					</div>

					<div
						className={cn(
							'p-3 rounded-xl text-sm',
							isAboveAverage
								? 'bg-tiimo-green/10 text-tiimo-green'
								: 'bg-muted/50 text-muted-foreground'
						)}
					>
						<div className="flex items-center gap-2">
							<TrendingUp className={cn('w-4 h-4', !isAboveAverage && 'rotate-180')} />
							<span className="font-numeric font-medium">
								{isAboveAverage ? '+' : ''}
								{difference.toFixed(1)}% vs average
							</span>
						</div>
						<p className="text-xs mt-1 text-muted-foreground">{percentileMessage}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
