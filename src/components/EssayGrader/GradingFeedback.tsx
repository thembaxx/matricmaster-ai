'use client';

import {
	ArrowRight01Icon,
	Chat01Icon,
	CheckmarkCircle02Icon,
	Idea01Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getGradeBadge, getGradeColor } from './constants';
import type { GradingResult } from './types';

interface GradingFeedbackProps {
	result: GradingResult | null;
	onReset: () => void;
}

export function GradingFeedback({ result, onReset }: GradingFeedbackProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Feedback</CardTitle>
				<CardDescription>
					{result ? 'Your detailed grading results' : 'Your results will appear here'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{!result ? (
					<div className="text-center py-12 text-muted-foreground">
						<div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
							<HugeiconsIcon icon={Idea01Icon} className="w-10 h-10 opacity-50" />
						</div>
						<p className="font-medium">Submit your essay to receive detailed feedback</p>
					</div>
				) : (
					<div className="space-y-6">
						<div className="text-center">
							<div className="text-5xl font-bold mb-2">
								<span className={getGradeColor(result.totalScore)}>{result.totalScore}</span>
								<span className="text-2xl text-muted-foreground">/100</span>
							</div>
							<Badge className={getGradeBadge(result.suggestedGrade)}>
								Grade: {result.suggestedGrade}
							</Badge>
						</div>

						<div className="space-y-3">
							<h4 className="font-medium flex items-center gap-2">
								<HugeiconsIcon icon={Target01Icon} className="w-4 h-4" />
								Score Breakdown
							</h4>
							<div className="space-y-2">
								<div className="space-y-1">
									<div className="flex justify-between text-sm">
										<span>Content & Relevance</span>
										<span className={getGradeColor(result.breakdown.content * 4)}>
											{result.breakdown.content}/25
										</span>
									</div>
									<Progress value={result.breakdown.content * 4} className="h-2" />
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-sm">
										<span>Structure & Organization</span>
										<span className={getGradeColor(result.breakdown.structure * 4)}>
											{result.breakdown.structure}/25
										</span>
									</div>
									<Progress value={result.breakdown.structure * 4} className="h-2" />
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-sm">
										<span>Argument & Analysis</span>
										<span className={getGradeColor(result.breakdown.argument * 4)}>
											{result.breakdown.argument}/25
										</span>
									</div>
									<Progress value={result.breakdown.argument * 4} className="h-2" />
								</div>
								<div className="space-y-1">
									<div className="flex justify-between text-sm">
										<span>Language & Style</span>
										<span className={getGradeColor(result.breakdown.language * 4)}>
											{result.breakdown.language}/25
										</span>
									</div>
									<Progress value={result.breakdown.language * 4} className="h-2" />
								</div>
							</div>
						</div>

						{result.strengths.length > 0 && (
							<div className="space-y-2">
								<h4 className="font-medium flex items-center gap-2 text-green-500">
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
									Strengths
								</h4>
								<ul className="space-y-1">
									{result.strengths.map((strength) => (
										<li key={strength} className="text-sm text-muted-foreground flex gap-2">
											<span className="text-green-500 shrink-0">•</span>
											{strength}
										</li>
									))}
								</ul>
							</div>
						)}

						{result.improvements.length > 0 && (
							<div className="space-y-2">
								<h4 className="font-medium flex items-center gap-2 text-yellow-500">
									<HugeiconsIcon icon={Idea01Icon} className="w-4 h-4" />
									Areas for Improvement
								</h4>
								<ul className="space-y-1">
									{result.improvements.map((improvement) => (
										<li key={improvement} className="text-sm text-muted-foreground flex gap-2">
											<span className="text-yellow-500 shrink-0">•</span>
											{improvement}
										</li>
									))}
								</ul>
							</div>
						)}

						{result.detailedFeedback && (
							<div className="space-y-2">
								<h4 className="font-medium flex items-center gap-2">
									<HugeiconsIcon icon={Chat01Icon} className="w-4 h-4" />
									Overall Feedback
								</h4>
								<p className="text-sm text-muted-foreground">{result.detailedFeedback}</p>
							</div>
						)}

						<Button variant="outline" className="w-full" onClick={onReset}>
							Try Another Essay
							<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
