'use client';

import dynamic from 'next/dynamic';

const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const ResponsiveContainer = dynamic(
	() => import('recharts').then((mod) => mod.ResponsiveContainer),
	{ ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
	if (active && payload?.length) {
		return (
			<div className="bg-background border border-border/50 rounded-lg px-3 py-2 shadow-xl">
				<p className="text-xs font-bold">{payload[0].name}</p>
				<p className="text-sm font-black" style={{ color: payload[0].payload.fill }}>
					{payload[0].value} licenses
				</p>
			</div>
		);
	}
	return null;
}

interface LicenseUsageChartProps {
	pieData: Array<{ name: string; value: number; color: string }>;
}

export function LicenseUsageChart({ pieData }: LicenseUsageChartProps) {
	return (
		<div className="h-48">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={pieData}
						cx="50%"
						cy="50%"
						innerRadius={50}
						outerRadius={80}
						paddingAngle={4}
						dataKey="value"
					>
						{pieData.map((entry) => (
							<Cell key={`license-usage-cell-${entry.name}`} fill={entry.color} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
