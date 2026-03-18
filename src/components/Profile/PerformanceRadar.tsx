'use client';

import dynamic from 'next/dynamic';
import { memo, useId, useMemo } from 'react';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';

const RadarChart = dynamic(() => import('recharts').then((mod) => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then((mod) => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then((mod) => mod.PolarAngleAxis), {
	ssr: false,
});
const Radar = dynamic(() => import('recharts').then((mod) => mod.Radar), { ssr: false });

interface ChartDataItem {
	subject: string;
	you: number;
	average: number;
}

const defaultChartData: ChartDataItem[] = [
	{ subject: 'MATH', you: 0, average: 70 },
	{ subject: 'PHY SCI', you: 0, average: 75 },
	{ subject: 'ENG FAL', you: 0, average: 65 },
	{ subject: 'LIFE OR.', you: 0, average: 60 },
	{ subject: 'GEOG', you: 0, average: 65 },
	{ subject: 'ACC', you: 0, average: 75 },
	{ subject: 'HIST', you: 0, average: 70 },
];

const chartConfig = {
	you: { label: 'You', color: 'var(--primary)' },
	average: { label: 'Average', color: 'var(--muted-foreground)' },
} satisfies ChartConfig;

interface PerformanceRadarProps {
	userAccuracy: number;
	viewMode: 'my_stats' | 'provincial';
}

export const PerformanceRadar = memo(function PerformanceRadar({
	userAccuracy,
	viewMode,
}: PerformanceRadarProps) {
	const radarGradientId = useId();

	const chartData: ChartDataItem[] = useMemo(
		() =>
			defaultChartData.map((item) => ({
				...item,
				you: item.subject === 'MATH' ? userAccuracy : Math.max(0, userAccuracy - 10),
			})),
		[userAccuracy]
	);

	return (
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
	);
});
