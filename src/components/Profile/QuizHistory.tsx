'use client';

import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuizResult {
	id: string;
	subjectId: number;
	subjectName?: string;
	percentage: number;
	timeTaken: number;
	completedAt: string | Date;
}

interface QuizHistoryProps {
	quizResults: QuizResult[];
}

type FilterTab = 'all' | 'week' | 'month';

function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes === 0) {
		return `${remainingSeconds}s`;
	}
	return `${minutes}m ${remainingSeconds}s`;
}

function formatRelativeDate(date: string | Date): string {
	const now = new Date();
	const completedDate = new Date(date);
	const diffMs = now.getTime() - completedDate.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return 'Today';
	}
	if (diffDays === 1) {
		return 'Yesterday';
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`;
	}

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	return `${months[completedDate.getMonth()]} ${completedDate.getDate()}`;
}

function getScoreColor(percentage: number): string {
	if (percentage > 70) return '#22c55e';
	if (percentage >= 50) return '#eab308';
	return '#ef4444';
}

function getScoreBgColor(percentage: number): string {
	if (percentage > 70) return 'bg-[#22c55e]/10';
	if (percentage >= 50) return 'bg-[#eab308]/10';
	return 'bg-[#ef4444]/10';
}

const subjectNames: Record<number, string> = {
	1: 'Mathematics',
	2: 'Physical Sciences',
	3: 'Life Sciences',
	4: 'Geography',
	5: 'History',
	6: 'English',
	7: 'Afrikaans',
	8: 'Economics',
};

export default function QuizHistory({ quizResults }: QuizHistoryProps) {
	const [filter, setFilter] = useState<FilterTab>('all');

	const now = new Date();
	const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const filteredResults = quizResults.filter((result) => {
		const completedDate = new Date(result.completedAt);
		if (filter === 'week') {
			return completedDate >= weekAgo;
		}
		if (filter === 'month') {
			return completedDate >= monthAgo;
		}
		return true;
	});

	const displayResults = filteredResults.slice(0, 10);

	const totalQuizzes = quizResults.length;
	const averageScore =
		quizResults.length > 0
			? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
			: 0;
	const bestScore = quizResults.length > 0 ? Math.max(...quizResults.map((r) => r.percentage)) : 0;
	const totalTimeSpent = quizResults.reduce((sum, r) => sum + r.timeTaken, 0);

	const tabs: { key: FilterTab; label: string }[] = [
		{ key: 'all', label: 'All' },
		{ key: 'week', label: 'This Week' },
		{ key: 'month', label: 'This Month' },
	];

	if (quizResults.length === 0) {
		return (
			<Card className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm">
				<h3 className="text-lg font-semibold text-foreground mb-4">Quiz History</h3>
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<p className="text-label-secondary">
						No quizzes yet. Start a quiz to track your progress!
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm">
			<h3 className="text-lg font-semibold text-foreground mb-6">Quiz History</h3>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				<div className="text-center p-4 rounded-2xl bg-background/50">
					<p className="text-[10px] font-black text-label-tertiary tracking-[0.3em] mb-1">Total</p>
					<p className="text-2xl font-bold text-foreground">{totalQuizzes}</p>
				</div>
				<div className="text-center p-4 rounded-2xl bg-background/50">
					<p className="text-[10px] font-black text-label-tertiary tracking-[0.3em] mb-1">
						Average
					</p>
					<p className="text-2xl font-bold text-foreground">{averageScore}%</p>
				</div>
				<div className="text-center p-4 rounded-2xl bg-background/50">
					<p className="text-[10px] font-black text-label-tertiary tracking-[0.3em] mb-1">Best</p>
					<p className="text-2xl font-bold text-[#22c55e]">{bestScore}%</p>
				</div>
				<div className="text-center p-4 rounded-2xl bg-background/50">
					<p className="text-[10px] font-black text-label-tertiary tracking-[0.3em] mb-1">Time</p>
					<p className="text-2xl font-bold text-foreground">{Math.floor(totalTimeSpent / 60)}m</p>
				</div>
			</div>

			<div className="flex gap-2 mb-6">
				{tabs.map((tab) => (
					<Button
						key={tab.key}
						variant={filter === tab.key ? 'default' : 'outline'}
						size="sm"
						onClick={() => setFilter(tab.key)}
						className={`rounded-full text-xs font-medium ${
							filter === tab.key
								? 'bg-primary-violet text-white'
								: 'border-border text-label-secondary hover:bg-background'
						}`}
					>
						{tab.label}
					</Button>
				))}
			</div>

			<div className="space-y-3">
				{displayResults.map((result, index) => (
					<motion.div
						key={result.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
						className="flex items-center justify-between p-4 rounded-2xl bg-background/30 hover:bg-background/50 transition-colors"
					>
						<div className="flex items-center gap-4">
							<div
								className={`w-10 h-10 rounded-xl flex items-center justify-center ${getScoreBgColor(
									result.percentage
								)}`}
							>
								<TrendingUp
									className="w-5 h-5"
									style={{ color: getScoreColor(result.percentage) }}
								/>
							</div>
							<div>
								<p className="font-medium text-foreground">
									{subjectNames[result.subjectId] || `Subject ${result.subjectId}`}
								</p>
								<div className="flex items-center gap-3 text-xs text-label-tertiary">
									<span className="flex items-center gap-1">
										<Calendar className="w-3 h-3" />
										{formatRelativeDate(result.completedAt)}
									</span>
									<span className="flex items-center gap-1">
										<Clock className="w-3 h-3" />
										{formatTime(result.timeTaken)}
									</span>
								</div>
							</div>
						</div>
						<div
							className={`px-4 py-2 rounded-xl font-bold text-sm ${getScoreBgColor(
								result.percentage
							)}`}
						>
							<span style={{ color: getScoreColor(result.percentage) }}>
								{Math.round(result.percentage)}%
							</span>
						</div>
					</motion.div>
				))}
			</div>

			{displayResults.length === 0 && (
				<p className="text-center text-label-tertiary py-8">No quizzes found for this period.</p>
			)}
		</Card>
	);
}
