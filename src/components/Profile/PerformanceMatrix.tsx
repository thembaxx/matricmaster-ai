'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const RadarChart = dynamic(() => import('recharts').then((mod) => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then((mod) => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then((mod) => mod.PolarAngleAxis), {
	ssr: false,
});
const Radar = dynamic(() => import('recharts').then((mod) => mod.Radar), { ssr: false });

interface PerformanceMatrixProps {
	viewMode: 'my_stats' | 'provincial';
	setViewMode: (mode: 'my_stats' | 'provincial') => void;
	chartData: any[];
	radarGradientId: string;
	chartConfig: any;
}

export function PerformanceMatrix({
	viewMode,
	setViewMode,
	chartData,
	radarGradientId,
	chartConfig,
}: PerformanceMatrixProps) {
	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
					Performance Matrix
				</h3>
				<div className="flex justify-start p-1 bg-muted rounded-xl">
					<button
						type="button"
						onClick={() => setViewMode('my_stats')}
						aria-pressed={viewMode === 'my_stats'}
						className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ios-active-scale ${viewMode === 'my_stats' ? 'bg-background shadow-sm text-foreground' : 'text-label-tertiary'}`}
					>
						Individual
					</button>
					<button
						type="button"
						onClick={() => setViewMode('provincial')}
						aria-pressed={viewMode === 'provincial'}
						className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ios-active-scale ${viewMode === 'provincial' ? 'bg-background shadow-sm text-foreground' : 'text-label-tertiary'}`}
					>
						Benchmarked
					</button>
				</div>
			</div>

			<Card className="rounded-3xl border border-border p-6 sm:p-8 bg-card/50 backdrop-blur-sm">
				<ChartContainer config={chartConfig} className="h-75 sm:h-100 w-full">
					<RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
						<defs>
							<linearGradient id={radarGradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--primary-violet)" stopOpacity={0.8} />
								<stop offset="100%" stopColor="var(--primary-violet)" stopOpacity={0.2} />
							</linearGradient>
						</defs>
						<PolarGrid stroke="var(--border)" strokeOpacity={0.5} />
						<PolarAngleAxis
							dataKey="subject"
							tick={{ fill: 'var(--label-secondary)', fontSize: 10, fontWeight: 900 }}
						/>
						<Radar
							name="You"
							dataKey="you"
							stroke="var(--primary-violet)"
							strokeWidth={4}
							fill={`url(#${radarGradientId})`}
							fillOpacity={0.6}
						/>
						{viewMode === 'provincial' && (
							<Radar
								name="Average"
								dataKey="average"
								stroke="var(--label-tertiary)"
								strokeWidth={2}
								fill="transparent"
								strokeDasharray="8 8"
								opacity={0.4}
							/>
						)}
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
					</RadarChart>
				</ChartContainer>
			</Card>
		</div>
	);
}
