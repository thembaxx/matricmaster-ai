'use client';

import { CheckCircleIcon, HelpCircleIcon, XCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KnowledgeHealthData {
	overallScore: number;
	quizAccuracy: number;
	flashcardRetention: number;
	subjectBreakdown: Array<{
		subjectId: number;
		subjectName: string;
		quizAccuracy: number;
		flashcardRetention: number;
		knowledgeHealthScore: number;
	}>;
	calculatedAt: string;
}

function getScoreColor(score: number): string {
	if (score >= 70) return '#10b981';
	if (score >= 40) return '#f59e0b';
	return '#ef4444';
}

function getScoreLabel(score: number): string {
	if (score >= 70) return 'Good';
	if (score >= 40) return 'Fair';
	return 'Needs Work';
}

function CircularProgressRing({
	score,
	size = 120,
	strokeWidth = 10,
}: {
	score: number;
	size?: number;
	strokeWidth?: number;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (score / 100) * circumference;
	const color = getScoreColor(score);

	return (
		<svg width={size} height={size} className="transform -rotate-90">
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke="currentColor"
				strokeWidth={strokeWidth}
				fill="none"
				className="text-muted"
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke={color}
				strokeWidth={strokeWidth}
				fill="none"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				strokeLinecap="round"
				className="transition-all duration-700 ease-out"
			/>
		</svg>
	);
}

function ProgressBarWithLabel({ label, score }: { label: string; score: number }) {
	const color = getScoreColor(score);

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium">{label}</span>
				<span className="font-mono font-medium" style={{ color }}>
					{score}%
				</span>
			</div>
			<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
				<div
					className="h-full transition-all duration-500 ease-out"
					style={{
						width: `${score}%`,
						backgroundColor: color,
					}}
				/>
			</div>
		</div>
	);
}

export function KnowledgeHealthWidget() {
	const [data, setData] = useState<KnowledgeHealthData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showTooltip, setShowTooltip] = useState(false);

	useEffect(() => {
		async function fetchKnowledgeHealth() {
			try {
				const response = await fetch('/api/progress/knowledge-health');
				if (!response.ok) {
					throw new Error('Failed to fetch knowledge health');
				}
				const result = await response.json();
				setData(result);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		}

		fetchKnowledgeHealth();
	}, []);

	if (loading) {
		return (
			<Card className="h-full">
				<CardHeader className="pb-2">
					<CardTitle className="text-base font-medium">Knowledge Health</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2 text-muted-foreground">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<span className="font-medium">Loading...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="h-full">
				<CardHeader className="pb-2">
					<CardTitle className="text-base font-medium">Knowledge Health</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<div className="flex items-center gap-2 text-red-600">
						<XCircleIcon className="h-5 w-5" />
						<span className="font-medium">{error}</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data) return null;

	const { overallScore, quizAccuracy, flashcardRetention } = data;
	const scoreColor = getScoreColor(overallScore);
	const scoreLabel = getScoreLabel(overallScore);

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-base font-medium flex items-center gap-2">
					Knowledge Health
					<button
						type="button"
						onMouseEnter={() => setShowTooltip(true)}
						onMouseLeave={() => setShowTooltip(false)}
						className="relative text-muted-foreground hover:text-foreground transition-colors"
					>
						<HelpCircleIcon className="h-4 w-4" />
						{showTooltip && (
							<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-popover border rounded-lg shadow-lg text-sm z-50">
								<p className="font-medium mb-2">Score Breakdown</p>
								<div className="space-y-1.5 text-muted-foreground">
									<p>
										<strong className="text-foreground">Quiz Accuracy:</strong> {quizAccuracy}% (60%
										weight)
									</p>
									<p>
										<strong className="text-foreground">Flashcard Retention:</strong>{' '}
										{flashcardRetention}% (40% weight)
									</p>
									<p className="text-xs pt-1">Based on your last 30 days of activity</p>
								</div>
							</div>
						)}
					</button>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-center">
					<div className="relative flex flex-col items-center">
						<CircularProgressRing score={overallScore} size={100} strokeWidth={8} />
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span
								className="text-2xl font-bold font-mono"
								style={{ color: scoreColor, fontFamily: 'Geist, sans-serif' }}
							>
								{overallScore}
							</span>
							<span className="text-xs text-muted-foreground">/100</span>
						</div>
					</div>
				</div>

				<div
					className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
					style={{
						backgroundColor: `${scoreColor}15`,
						color: scoreColor,
					}}
				>
					{overallScore >= 70 ? (
						<CheckCircleIcon className="h-4 w-4" />
					) : overallScore >= 40 ? (
						<CheckCircleIcon className="h-4 w-4" />
					) : (
						<XCircleIcon className="h-4 w-4" />
					)}
					{scoreLabel}
				</div>

				<div className="space-y-3 pt-2 border-t">
					<ProgressBarWithLabel label="Quiz Accuracy" score={quizAccuracy} />
					<ProgressBarWithLabel label="Flashcard Retention" score={flashcardRetention} />
				</div>
			</CardContent>
		</Card>
	);
}
