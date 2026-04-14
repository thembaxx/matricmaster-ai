'use client';

import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

interface AccuracyTrendProps {
	data: { date: string; accuracy: number }[];
	subject: string;
	color: string;
}

export function AccuracyTrend({ data, subject, color }: AccuracyTrendProps) {
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (data.length === 0) return null;

	const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const currentAccuracy = sorted[sorted.length - 1].accuracy;
	const previousAccuracy = sorted.length > 1 ? sorted[sorted.length - 2].accuracy : currentAccuracy;
	const change = currentAccuracy - previousAccuracy;
	const isImproving = change >= 0;

	const chartConfig = {
		accuracy: {
			label: 'Accuracy',
			color,
		},
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-bold">{subject} Accuracy</CardTitle>
					<Badge
						variant="outline"
						className={cn(
							'font-numeric gap-1',
							isImproving ? 'text-tiimo-green' : 'text-destructive'
						)}
						style={{ borderColor: isImproving ? 'var(--tiimo-green)' : undefined }}
					>
						<HugeiconsIcon
							icon={isImproving ? ArrowUp01Icon : ArrowDown01Icon}
							className="w-3 h-3"
						/>
						{Math.abs(change).toFixed(1)}%
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4">
					<div className="flex-1 h-20">
						<ChartContainer config={chartConfig} className="h-20 w-full">
							<AreaChart data={sorted} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
								<defs>
									<linearGradient id={`gradient-${subject}`} x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={color} stopOpacity={0.3} />
										<stop offset="100%" stopColor={color} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									className="stroke-border/50"
									vertical={false}
								/>
								<XAxis
									dataKey="date"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
									tickFormatter={(val) => {
										const d = new Date(val);
										return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
									}}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
									domain={[0, 100]}
									tickFormatter={(val) => `${val}%`}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											labelFormatter={(label) => {
												const d = new Date(label);
												return d.toLocaleDateString('en-ZA', {
													day: 'numeric',
													month: 'short',
												});
											}}
											formatter={(value) => `${Number(value).toFixed(1)}%`}
										/>
									}
								/>
								<Area
									type="monotone"
									dataKey="accuracy"
									stroke={color}
									fill={`url(#gradient-${subject})`}
									strokeWidth={2}
									animationDuration={prefersReducedMotion ? 0 : 800}
								/>
							</AreaChart>
						</ChartContainer>
					</div>

					<div className="text-center shrink-0">
						<p className="text-2xl font-bold font-numeric" style={{ color }}>
							{currentAccuracy.toFixed(0)}%
						</p>
						<p className="text-xs text-muted-foreground">current</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function AccuracySparkline({ data, subject, color }: AccuracyTrendProps) {
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (data.length === 0) return null;

	const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const currentAccuracy = sorted[sorted.length - 1].accuracy;
	const previousAccuracy = sorted.length > 1 ? sorted[sorted.length - 2].accuracy : currentAccuracy;
	const change = currentAccuracy - previousAccuracy;
	const isImproving = change >= 0;

	return (
		<Card>
			<CardContent className="pt-4">
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-medium">{subject}</p>
					<div className="flex items-center gap-1">
						<HugeiconsIcon
							icon={isImproving ? ArrowUp01Icon : ArrowDown01Icon}
							className={cn('w-3 h-3', isImproving ? 'text-tiimo-green' : 'text-destructive')}
						/>
						<span
							className={cn(
								'text-xs font-numeric',
								isImproving ? 'text-tiimo-green' : 'text-destructive'
							)}
						>
							{Math.abs(change).toFixed(1)}%
						</span>
					</div>
				</div>
				<div className="h-12">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={sorted} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
							<defs>
								<linearGradient id={`spark-gradient-${subject}`} x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor={color} stopOpacity={0.2} />
									<stop offset="100%" stopColor={color} stopOpacity={0} />
								</linearGradient>
							</defs>
							<Area
								type="monotone"
								dataKey="accuracy"
								stroke={color}
								fill={`url(#spark-gradient-${subject})`}
								strokeWidth={1.5}
								dot={false}
								animationDuration={prefersReducedMotion ? 0 : 600}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
				<div className="flex items-center justify-between mt-2">
					<span className="text-xs text-muted-foreground">Accuracy</span>
					<span className="text-lg font-bold font-numeric" style={{ color }}>
						{currentAccuracy.toFixed(0)}%
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
