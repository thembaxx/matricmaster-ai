'use client';

import { CheckCircle2, Star, ThumbsDown, ThumbsUp, TrendingUp, XCircle } from 'lucide-react';
import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface PredictionAccuracyData {
	subject: string;
	academicYear: number;
	predictedTopics: string[];
	actualTopics: string[];
	correctPredictions: number;
	totalPredictions: number;
	accuracy: number;
	predictedQuestionsCount: number;
	actualQuestionsCount: number;
}

interface PredictionAccuracyProps {
	data?: PredictionAccuracyData | null;
	isLoading?: boolean;
	onFeedback?: (helpful: boolean) => void;
	className?: string;
}

export function PredictionAccuracy({
	data,
	isLoading,
	onFeedback,
	className,
}: PredictionAccuracyProps) {
	if (isLoading) {
		return <PredictionAccuracySkeleton />;
	}

	if (!data) {
		return null;
	}

	const accuracyPercent = Math.round(data.accuracy * 100);
	const performanceLevel = getPerformanceLevel(accuracyPercent);

	return (
		<Card className={cn('p-4', className)}>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{performanceLevel.icon}
						<div>
							<h3 className="font-medium text-sm">{performanceLevel.title}</h3>
							<p className="text-xs text-muted-foreground">{performanceLevel.description}</p>
						</div>
					</div>
					<div className="text-3xl font-bold tabular-nums">{accuracyPercent}%</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>Prediction accuracy</span>
						<span>
							{data.correctPredictions} of {data.totalPredictions} topics
						</span>
					</div>
					<Progress value={accuracyPercent} className="h-3" />
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
						<div className="flex items-center gap-2 mb-1">
							<CheckCircle2 className="w-4 h-4 text-green-600" />
							<span className="text-xs text-muted-foreground">Predicted correctly</span>
						</div>
						<div className="text-xl font-bold text-green-600 tabular-nums">
							{data.correctPredictions}
						</div>
					</div>
					<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
						<div className="flex items-center gap-2 mb-1">
							<XCircle className="w-4 h-4 text-red-600" />
							<span className="text-xs text-muted-foreground">Missed topics</span>
						</div>
						<div className="text-xl font-bold text-red-600 tabular-nums">
							{data.totalPredictions - data.correctPredictions}
						</div>
					</div>
				</div>

				<div className="p-3 rounded-lg bg-muted/50">
					<div className="text-xs text-muted-foreground mb-1">Question coverage</div>
					<div className="flex items-baseline gap-1">
						<span className="text-lg font-bold tabular-nums">{data.predictedQuestionsCount}</span>
						<span className="text-xs text-muted-foreground">of</span>
						<span className="text-lg font-bold tabular-nums">{data.actualQuestionsCount}</span>
						<span className="text-xs text-muted-foreground">predicted</span>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1 gap-2"
						onClick={() => onFeedback?.(true)}
					>
						<ThumbsUp className="w-4 h-4" />
						Helpful
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex-1 gap-2"
						onClick={() => onFeedback?.(false)}
					>
						<ThumbsDown className="w-4 h-4" />
						Needs work
					</Button>
				</div>
			</div>
		</Card>
	);
}

export function PredictionAccuracySummary({
	predictions,
}: {
	predictions: { accuracy: number; count: number }[];
}) {
	if (predictions.length === 0) {
		return (
			<Card className="p-6 text-center">
				<TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
				<h3 className="font-medium mb-1">No history yet</h3>
				<p className="text-xs text-muted-foreground">
					Prediction accuracy will appear here after exams
				</p>
			</Card>
		);
	}

	const averageAccuracy =
		predictions.reduce((sum, p) => sum + p.accuracy * p.count, 0) /
		predictions.reduce((sum, p) => sum + p.count, 0);

	const totalPredictions = predictions.reduce((sum, p) => sum + p.count, 0);

	return (
		<Card className="p-4">
			<h3 className="font-medium mb-3 flex items-center gap-2">
				<Star className="w-4 h-4 text-yellow-500" />
				Accuracy over time
			</h3>

			<div className="space-y-3">
				{predictions.map((p, idx) => (
					<div key={idx} className="space-y-1">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Year {idx + 1}</span>
							<span className="font-medium tabular-nums">{Math.round(p.accuracy * 100)}%</span>
						</div>
						<Progress value={p.accuracy * 100} className="h-2" />
					</div>
				))}
			</div>

			<div className="mt-4 pt-4 border-t">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Average accuracy</span>
					<span className="text-lg font-bold tabular-nums">
						{Math.round(averageAccuracy * 100)}%
					</span>
				</div>
				<p className="text-xs text-muted-foreground mt-1">
					Based on {totalPredictions} predictions
				</p>
			</div>
		</Card>
	);
}

export function PredictionAccuracySkeleton() {
	return (
		<Card className="p-4 space-y-4 animate-pulse">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-muted" />
					<div className="space-y-1">
						<div className="h-4 w-24 bg-muted rounded" />
						<div className="h-3 w-32 bg-muted rounded" />
					</div>
				</div>
				<div className="h-8 w-16 bg-muted rounded" />
			</div>
			<div className="h-3 bg-muted rounded" />
			<div className="grid grid-cols-2 gap-3">
				<div className="h-16 bg-muted rounded-lg" />
				<div className="h-16 bg-muted rounded-lg" />
			</div>
		</Card>
	);
}

function getPerformanceLevel(accuracy: number): {
	icon: React.ReactNode;
	title: string;
	description: string;
} {
	if (accuracy >= 80) {
		return {
			icon: <Star className="w-8 h-8 text-yellow-500" />,
			title: 'Excellent predictions!',
			description: 'Our AI nailed most exam topics',
		};
	}
	if (accuracy >= 60) {
		return {
			icon: <TrendingUp className="w-8 h-8 text-green-500" />,
			title: 'Good accuracy',
			description: 'Most predictions were on target',
		};
	}
	if (accuracy >= 40) {
		return {
			icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
			title: 'Mixed results',
			description: 'Some topics were predicted correctly',
		};
	}
	return {
		icon: <XCircle className="w-8 h-8 text-red-500" />,
		title: 'Needs improvement',
		description: 'Prediction model is being updated',
	};
}
