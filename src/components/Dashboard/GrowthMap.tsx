'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface WeaknessData {
	topic: string;
	mistakeCount: number;
	subject: string;
}

interface GrowthMapProps {
	data: WeaknessData[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export function GrowthMap({ data }: GrowthMapProps) {
	const sortedData = [...data].sort((a, b) => b.mistakeCount - a.mistakeCount).slice(0, 8);

	if (sortedData.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No weakness data yet. Complete some quizzes to see your Growth Map.
			</div>
		);
	}

	return (
		<div className="h-64">
			<ResponsiveContainer height="100%" width="100%">
				<BarChart data={sortedData} layout="vertical" margin={{ left: 100 }}>
					<XAxis hide type="number" />
					<YAxis dataKey="topic" tick={{ fontSize: 12 }} type="category" width={100} />
					<Tooltip
						content={({ active, payload }) => {
							if (active && payload?.length) {
								const item = payload[0].payload;
								return (
									<div className="bg-background border rounded-lg p-2 shadow-lg">
										<p className="font-medium">{item.topic}</p>
										<p className="text-sm text-muted-foreground">{item.mistakeCount} mistakes</p>
									</div>
								);
							}
							return null;
						}}
					/>
					<Bar dataKey="mistakeCount" radius={[0, 4, 4, 0]}>
						{sortedData.map((_, index) => (
							<Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
