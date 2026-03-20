'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SubjectPerformance {
	subjectId: number;
	subjectName: string;
	questionsAttempted: number;
	averageScore: number;
}

interface SubjectPerformanceChartProps {
	subjectPerformance: SubjectPerformance[];
}

export function SubjectPerformanceChart({ subjectPerformance }: SubjectPerformanceChartProps) {
	return (
		<div className="h-80">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={subjectPerformance} layout="vertical" margin={{ left: 100, right: 20 }}>
					<XAxis type="number" domain={[0, 100]} hide />
					<YAxis
						dataKey="subjectName"
						type="category"
						tick={{ fontSize: 12, fontWeight: 500 }}
						width={100}
					/>
					<Tooltip
						content={({ active, payload }) => {
							if (active && payload?.length) {
								const data = payload[0].payload;
								return (
									<div className="bg-background border border-border/50 rounded-lg px-3 py-2 shadow-xl">
										<p className="font-bold">{data.subjectName}</p>
										<p className="text-sm text-primary">Average: {data.averageScore}%</p>
										<p className="text-xs text-muted-foreground">
											{data.questionsAttempted.toLocaleString()} attempts
										</p>
									</div>
								);
							}
							return null;
						}}
					/>
					<Bar dataKey="averageScore" radius={[0, 4, 4, 0]} maxBarSize={24}>
						{subjectPerformance.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={
									entry.averageScore >= 80
										? 'var(--color-success)'
										: entry.averageScore >= 60
											? 'var(--color-primary)'
											: 'var(--color-warning)'
								}
							/>
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
