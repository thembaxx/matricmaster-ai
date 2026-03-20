'use client';

import {
	ArrowDown01Icon,
	ArrowUp01Icon,
	BookOpen01Icon,
	CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GrowthTopic {
	topic: string;
	mistakes: number;
	subject: string;
	confidence: number | null;
	trend: 'up' | 'down' | 'stable';
	struggleCount: number;
}

interface GrowthMapProps {
	data: GrowthTopic[];
}

function getBarColor(mistakes: number): string {
	if (mistakes > 10) return '#ef4444';
	if (mistakes >= 5) return '#f59e0b';
	return '#22c55e';
}

function getSeverityLabel(mistakes: number): { label: string; color: string } {
	if (mistakes > 10) return { label: 'High', color: 'text-red-600 bg-red-50 dark:bg-red-950' };
	if (mistakes >= 5)
		return { label: 'Medium', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' };
	return { label: 'Low', color: 'text-green-600 bg-green-50 dark:bg-green-950' };
}

export function GrowthMap({ data }: GrowthMapProps) {
	const router = useRouter();
	const sortedData = [...data].sort((a, b) => b.mistakes - a.mistakes).slice(0, 8);

	if (sortedData.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No weakness data yet. Complete some quizzes to see your Growth Map.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="h-64">
				<ResponsiveContainer height="100%" width="100%">
					<BarChart data={sortedData} layout="vertical" margin={{ left: 100 }}>
						<XAxis hide type="number" />
						<YAxis dataKey="topic" tick={{ fontSize: 12 }} type="category" width={100} />
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload?.length) {
									const item = payload[0].payload as GrowthTopic;
									return (
										<div className="bg-background border rounded-lg p-3 shadow-lg">
											<p className="font-medium">{item.topic}</p>
											<p className="text-sm text-muted-foreground">{item.mistakes} mistakes</p>
											{item.confidence !== null && (
												<p className="text-sm text-muted-foreground">
													Confidence: {(item.confidence * 100).toFixed(0)}%
												</p>
											)}
										</div>
									);
								}
								return null;
							}}
						/>
						<Bar dataKey="mistakes" radius={[0, 4, 4, 0]}>
							{sortedData.map((entry, index) => (
								<Cell fill={getBarColor(entry.mistakes)} key={`cell-${index}`} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className="space-y-2">
				{sortedData.map((topic) => {
					const severity = getSeverityLabel(topic.mistakes);
					return (
						<div
							key={topic.topic}
							className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div
									className={cn(
										'w-2 h-2 rounded-full flex-shrink-0',
										topic.mistakes > 10
											? 'bg-red-500'
											: topic.mistakes >= 5
												? 'bg-amber-500'
												: 'bg-green-500'
									)}
								/>
								<div className="min-w-0">
									<p className="font-medium text-sm truncate">{topic.topic}</p>
									<div className="flex items-center gap-2 mt-0.5">
										<span
											className={cn(
												'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
												severity.color
											)}
										>
											{severity.label}
										</span>
										{topic.confidence !== null && (
											<span className="text-xs text-muted-foreground">
												{(topic.confidence * 100).toFixed(0)}% confidence
											</span>
										)}
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2 flex-shrink-0">
								{topic.trend === 'up' && (
									<HugeiconsIcon icon={ArrowUp01Icon} className="w-4 h-4 text-green-500" />
								)}
								{topic.trend === 'down' && (
									<HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-red-500" />
								)}
								{topic.trend === 'stable' && (
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="w-4 h-4 text-muted-foreground"
									/>
								)}

								<Button
									size="sm"
									variant="outline"
									className="h-7 text-xs rounded-lg"
									onClick={() =>
										router.push(
											`/tutor?topic=${encodeURIComponent(topic.topic)}&subject=${encodeURIComponent(topic.subject)}`
										)
									}
								>
									<HugeiconsIcon icon={BookOpen01Icon} className="w-3.5 h-3.5 mr-1" />
									Fix This
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
