import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Chart } from '@/components/ui/chart'; // Assume a chart wrapper exists
import { useAnalytics } from '@/hooks/useAnalytics';

export function PerformanceDashboard() {
	const { data, loading, error } = useAnalytics();

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error loading analytics.</div>;

	const { masteryLevels, recentQuizScore, velocity } = data;

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Card>
				<CardHeader>Subject Mastery</CardHeader>
				<CardContent>
					<Chart
						type="radar"
						data={masteryLevels.map((m) => ({
							subject: m.subject,
							mastery: m.mastery * 100,
						}))}
						xKey="subject"
						yKey="mastery"
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>Recent Quiz Score</CardHeader>
				<CardContent className="text-3xl font-bold text-center">{recentQuizScore}%</CardContent>
			</Card>
			<Card>
				<CardHeader>Learning Velocity</CardHeader>
				<CardContent className="text-3xl font-bold text-center">{velocity} pts/day</CardContent>
			</Card>
		</div>
	);
}
