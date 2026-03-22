'use client';

import { AlertTriangle, ChevronDown, ChevronUp, Play, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface TopicPredictionData {
	topic: string;
	subtopic?: string;
	probability: number;
	confidence: 'low' | 'medium' | 'high';
	isHotTopic: boolean;
	historicalAppearances: number;
	marksWeight: number;
	frequency: number;
	recency: number;
	difficultyAlignment: number;
	markerBias: number;
	curriculumChangeWarning: boolean;
	predictedQuestions: string[];
}

interface TopicPredictionCardProps {
	prediction: TopicPredictionData;
	subject: string;
	onPractice?: (topic: string) => void;
	onViewQuestions?: (topic: string) => void;
	className?: string;
}

const SUBJECT_EMOJIS: Record<string, string> = {
	Mathematics: '🔢',
	Physics: '⚡',
	Chemistry: '🧪',
	Biology: '🌱',
	Accounting: '📊',
	Economics: '💰',
	Geography: '🌍',
	History: '📜',
	default: '📚',
};

export function TopicPredictionCard({
	prediction,
	subject,
	onPractice,
	onViewQuestions,
	className,
}: TopicPredictionCardProps) {
	const [expanded, setExpanded] = React.useState(false);

	const emoji = SUBJECT_EMOJIS[subject] || SUBJECT_EMOJIS.default;
	const probabilityColor = getProbabilityColor(prediction.probability);
	const confidenceLabel = getConfidenceLabel(prediction.confidence);

	return (
		<Card
			className={cn(
				'overflow-hidden transition-all duration-200',
				prediction.isHotTopic && 'ring-2 ring-orange-500/50',
				className
			)}
		>
			<div className="p-4 space-y-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-start gap-3 flex-1 min-w-0">
						<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
							{emoji}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h3 className="font-medium text-sm leading-tight truncate">{prediction.topic}</h3>
								{prediction.isHotTopic && (
									<Badge variant="destructive" className="text-[10px] px-1.5 py-0">
										Hot
									</Badge>
								)}
								{prediction.curriculumChangeWarning && (
									<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
										<AlertTriangle className="w-3 h-3 mr-1" />
										Verify
									</Badge>
								)}
							</div>
							{prediction.subtopic && (
								<p className="text-xs text-muted-foreground mt-0.5">{prediction.subtopic}</p>
							)}
						</div>
					</div>

					<div className="flex-shrink-0 text-right">
						<div className="text-lg font-bold tabular-nums" style={{ color: probabilityColor }}>
							{prediction.probability}%
						</div>
						<div className="text-[10px] text-muted-foreground">{confidenceLabel}</div>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>Prediction confidence</span>
						<span className="tabular-nums">{prediction.probability}%</span>
					</div>
					<Progress value={prediction.probability} className="h-2" />
				</div>

				<div className="flex items-center justify-between text-xs">
					<div className="flex items-center gap-3 text-muted-foreground">
						<span className="flex items-center gap-1">
							<TrendingUp className="w-3 h-3" />
							<span className="tabular-nums">{prediction.historicalAppearances}x</span>
						</span>
						<span>{prediction.marksWeight} marks</span>
					</div>
					<div className="flex items-center gap-1">
						<Button
							size="sm"
							variant={prediction.isHotTopic ? 'destructive' : 'default'}
							className="h-7 text-xs gap-1"
							onClick={() => onPractice?.(prediction.topic)}
						>
							<Play className="w-3 h-3" />
							Practice
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="h-7 text-xs"
							onClick={() => setExpanded(!expanded)}
						>
							{expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
						</Button>
					</div>
				</div>
			</div>

			{expanded && (
				<div className="px-4 pb-4 space-y-3 border-t pt-3">
					<div className="grid grid-cols-2 gap-2 text-xs">
						<div className="space-y-1">
							<span className="text-muted-foreground">Frequency</span>
							<Progress value={prediction.frequency * 100} className="h-1" />
							<span className="tabular-nums">{Math.round(prediction.frequency * 100)}%</span>
						</div>
						<div className="space-y-1">
							<span className="text-muted-foreground">Recency</span>
							<Progress value={prediction.recency * 100} className="h-1" />
							<span className="tabular-nums">{Math.round(prediction.recency * 100)}%</span>
						</div>
						<div className="space-y-1">
							<span className="text-muted-foreground">Difficulty</span>
							<Progress value={prediction.difficultyAlignment * 100} className="h-1" />
							<span className="tabular-nums">
								{Math.round(prediction.difficultyAlignment * 100)}%
							</span>
						</div>
						<div className="space-y-1">
							<span className="text-muted-foreground">Marker Bias</span>
							<Progress value={prediction.markerBias * 100} className="h-1" />
							<span className="tabular-nums">{Math.round(prediction.markerBias * 100)}%</span>
						</div>
					</div>

					{prediction.predictedQuestions.length > 0 && (
						<div className="space-y-1.5">
							<span className="text-xs font-medium">Likely questions:</span>
							<ul className="space-y-1">
								{prediction.predictedQuestions.slice(0, 3).map((q, idx) => (
									<li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
										<span className="text-primary mt-0.5">•</span>
										<span className="leading-tight">{q}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					<Button
						size="sm"
						variant="outline"
						className="w-full text-xs"
						onClick={() => onViewQuestions?.(prediction.topic)}
					>
						View all questions
					</Button>
				</div>
			)}
		</Card>
	);
}

function getProbabilityColor(probability: number): string {
	if (probability >= 70) return 'hsl(0, 84%, 60%)';
	if (probability >= 50) return 'hsl(38, 92%, 50%)';
	return 'hsl(142, 76%, 36%)';
}

function getConfidenceLabel(confidence: 'low' | 'medium' | 'high'): string {
	switch (confidence) {
		case 'high':
			return 'High confidence';
		case 'medium':
			return 'Medium';
		case 'low':
			return 'Low data';
	}
}

export function TopicPredictionCardSkeleton() {
	return (
		<Card className="p-4 space-y-3">
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
				<div className="flex-1 space-y-2">
					<div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
					<div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
				</div>
				<div className="space-y-1 text-right">
					<div className="h-6 w-12 bg-muted animate-pulse rounded" />
					<div className="h-3 w-16 bg-muted animate-pulse rounded" />
				</div>
			</div>
			<div className="h-2 bg-muted animate-pulse rounded" />
			<div className="flex items-center justify-between">
				<div className="h-3 w-24 bg-muted animate-pulse rounded" />
				<div className="h-7 w-20 bg-muted animate-pulse rounded" />
			</div>
		</Card>
	);
}
