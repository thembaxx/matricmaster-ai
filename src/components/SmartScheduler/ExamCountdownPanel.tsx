'use client';

import { Card } from '@/components/ui/card';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

export function ExamCountdownPanel() {
	const { exams } = useSmartSchedulerStore();

	if (exams.length === 0) {
		return (
			<Card className="p-4">
				<h3 className="font-semibold mb-2">Exam Countdown</h3>
				<p className="text-sm text-muted-foreground">
					No exams scheduled yet. Add your exam dates to get personalized study recommendations.
				</p>
			</Card>
		);
	}

	return (
		<Card className="p-4">
			<h3 className="font-semibold mb-4">Exam Countdown</h3>
			<div className="space-y-3">
				{exams.map((exam) => (
					<div
						key={exam.id}
						className={`p-3 rounded-lg border ${
							exam.priority === 'high'
								? 'border-red-200 bg-red-50 dark:bg-red-950/20'
								: exam.priority === 'medium'
									? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20'
									: 'border-green-200 bg-green-50 dark:bg-green-950/20'
						}`}
					>
						<div className="font-medium">{exam.subject}</div>
						<div className="text-2xl font-bold mt-1">{exam.daysRemaining}</div>
						<div className="text-xs text-muted-foreground">days remaining</div>
					</div>
				))}
			</div>
		</Card>
	);
}
