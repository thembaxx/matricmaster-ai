'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface EssayEditorProps {
	topic: string;
	prompt?: string;
}

interface GradingResult {
	totalScore: number;
	breakdown: Record<string, number>;
	strengths: string[];
	improvements: string[];
	detailedFeedback: string;
	suggestedGrade: string;
}

export function EssayEditor({ topic, prompt }: EssayEditorProps) {
	const textareaId = useId();
	const [essay, setEssay] = useState('');
	const [feedback, setFeedback] = useState<GradingResult | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
	const charCount = essay.length;

	const handleGetFeedback = async () => {
		if (essay.trim().length < 50) {
			toast.error('Write at least 50 characters before requesting feedback.');
			return;
		}

		setIsLoading(true);
		setFeedback(null);

		try {
			const res = await fetch('/api/ai-tutor/essay-grader', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					essay,
					topic,
					subject: 'English',
					wordCount,
				}),
			});

			if (!res.ok) {
				throw new Error('Failed to get feedback');
			}

			const data = await res.json();
			if (data.grading) {
				setFeedback(data.grading);
				toast.success('Feedback received!');
			} else {
				throw new Error('Invalid response');
			}
		} catch {
			toast.error('Could not get AI feedback. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			{prompt && (
				<Card className="p-4 bg-primary/5 border-primary/20">
					<p className="text-sm font-medium mb-1">Essay Prompt</p>
					<p className="text-sm text-muted-foreground">{prompt}</p>
				</Card>
			)}

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<label htmlFor={textareaId} className="text-sm font-medium">
						Your Essay
					</label>
					<span className="text-xs text-muted-foreground">
						{wordCount} words · {charCount} characters
					</span>
				</div>
				<Textarea
					id={textareaId}
					value={essay}
					onChange={(e) => setEssay(e.target.value)}
					placeholder="Start writing your essay here..."
					className="min-h-[240px] resize-y"
				/>
			</div>

			<div className="flex justify-end">
				<Button
					onClick={handleGetFeedback}
					disabled={isLoading || essay.trim().length < 50}
					className="gap-2"
				>
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
					{isLoading ? 'Analyzing...' : 'Get AI Feedback'}
				</Button>
			</div>

			{feedback && (
				<Card className="p-5 space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-bold text-lg">Feedback</h4>
						<div className="flex items-center gap-2">
							<span className="text-2xl font-black text-primary">{feedback.suggestedGrade}</span>
							<span className="text-sm text-muted-foreground">{feedback.totalScore}/100</span>
						</div>
					</div>

					{feedback.breakdown && (
						<div className="grid grid-cols-2 gap-3">
							{Object.entries(feedback.breakdown).map(([key, value]) => (
								<div key={key} className="space-y-1">
									<div className="flex items-center justify-between text-xs">
										<span className="capitalize text-muted-foreground">
											{key.replace(/([A-Z])/g, ' $1').trim()}
										</span>
										<span className="font-mono">{value}/25</span>
									</div>
									<div className="h-1.5 bg-secondary rounded-full overflow-hidden">
										<div
											className="h-full bg-primary rounded-full transition-all"
											style={{ width: `${(value / 25) * 100}%` }}
										/>
									</div>
								</div>
							))}
						</div>
					)}

					{feedback.strengths?.length > 0 && (
						<div>
							<h5 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-1">
								Strengths
							</h5>
							<ul className="space-y-1">
								{feedback.strengths.map((s, i) => (
									<li
										key={i}
										className="text-sm text-muted-foreground pl-3 border-l-2 border-green-500/30"
									>
										{s}
									</li>
								))}
							</ul>
						</div>
					)}

					{feedback.improvements?.length > 0 && (
						<div>
							<h5 className="font-semibold text-sm text-amber-600 dark:text-amber-400 mb-1">
								Areas for Improvement
							</h5>
							<ul className="space-y-1">
								{feedback.improvements.map((s, i) => (
									<li
										key={i}
										className="text-sm text-muted-foreground pl-3 border-l-2 border-amber-500/30"
									>
										{s}
									</li>
								))}
							</ul>
						</div>
					)}

					{feedback.detailedFeedback && (
						<div>
							<h5 className="font-semibold text-sm mb-1">Detailed Feedback</h5>
							<p className="text-sm text-muted-foreground">{feedback.detailedFeedback}</p>
						</div>
					)}
				</Card>
			)}
		</div>
	);
}
