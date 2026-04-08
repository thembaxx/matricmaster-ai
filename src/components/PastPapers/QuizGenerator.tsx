'use client';

import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { type ExtractedQuestionPreview, QuestionSelector } from './QuestionSelector';

interface QuizGeneratorProps {
	paperId: string;
	paperTitle: string;
	subject: string;
	year: number;
	month: string;
	onQuizGenerated?: (quiz: QuizResult) => void;
	onCancel?: () => void;
	className?: string;
}

export interface QuizResult {
	id: string;
	title: string;
	subject: string;
	paperId: string;
	questions: QuizQuestion[];
	settings: QuizSettings;
	meta: QuizMeta;
}

interface QuizQuestion {
	id: string;
	question: string;
	type: 'mcq' | 'shortAnswer';
	options?: Array<{ id: string; text: string; isCorrect: boolean }>;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	marks: number;
	source: { paperId: string; year: number; month: string; paper: string };
}

interface QuizSettings {
	shuffleQuestions: boolean;
	showImmediateFeedback: boolean;
}

interface QuizMeta {
	totalQuestions: number;
	totalMarks: number;
	timeLimit: number;
	generatedFrom: string;
}

export function QuizGenerator({
	paperId,
	paperTitle,
	subject,
	year,
	month,
	onQuizGenerated,
	onCancel,
	className,
}: QuizGeneratorProps) {
	const id = useId();
	const questionCountId = `${id}-questionCount`;
	const timeLimitId = `${id}-timeLimit`;
	const shuffleId = `${id}-shuffle`;
	const feedbackId = `${id}-feedback`;

	const [questions, setQuestions] = useState<ExtractedQuestionPreview[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [questionCount, setQuestionCount] = useState<number | undefined>(undefined);
	const [timeLimit, setTimeLimit] = useState<number>(30);
	const [shuffleQuestions, setShuffleQuestions] = useState(true);
	const [showImmediateFeedback, setShowImmediateFeedback] = useState(true);

	const loadQuestions = useCallback(async () => {
		setIsLoadingQuestions(true);
		setError(null);

		try {
			const response = await fetch(`/api/quiz/from-past-paper/create?paperId=${paperId}`);
			const data = await response.json();

			if (!response.ok || !data.success || data.error) {
				throw new Error(data.error || 'Failed to load questions');
			}

			setQuestions(data.questions);
		} catch (_err) {
			setError("We couldn't load the questions. Check your connection and try again.");
		} finally {
			setIsLoadingQuestions(false);
		}
	}, [paperId]);

	const generateQuiz = useCallback(async () => {
		if (selectedIds.length === 0) {
			setError('Please select at least one question');
			return;
		}

		setIsGenerating(true);
		setError(null);

		try {
			const response = await fetch('/api/quiz/from-past-paper/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					paperId,
					questionIds: selectedIds,
					settings: {
						questionCount: questionCount,
						timeLimit,
						shuffleQuestions,
						showImmediateFeedback,
					},
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success || data.error) {
				throw new Error(data.error || 'Failed to generate quiz');
			}

			onQuizGenerated?.(data.quiz);
		} catch (_err) {
			setError("We couldn't generate your quiz. Try again or select fewer questions.");
		} finally {
			setIsGenerating(false);
		}
	}, [
		paperId,
		selectedIds,
		questionCount,
		timeLimit,
		shuffleQuestions,
		showImmediateFeedback,
		onQuizGenerated,
	]);

	return (
		<div className={cn('space-y-6', className)}>
			<Card className="p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-semibold">Generate quiz from {paperTitle}</h3>
						<p className="text-sm text-muted-foreground">
							{subject} - {month} {year}
						</p>
					</div>
					<Button variant="outline" onClick={loadQuestions} disabled={isLoadingQuestions}>
						{isLoadingQuestions ? (
							<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 animate-spin" />
						) : (
							'Load questions'
						)}
					</Button>
				</div>
			</Card>

			{error && (
				<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
					{error}
				</div>
			)}

			{questions.length > 0 && (
				<>
					<QuestionSelector
						questions={questions}
						selectedIds={selectedIds}
						onSelectionChange={setSelectedIds}
						maxSelection={questionCount}
					/>

					<Card className="p-4 space-y-4">
						<h4 className="font-medium">Quiz settings</h4>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor={questionCountId} className="text-sm">
									Maximum questions
								</Label>
								<Input
									id={questionCountId}
									type="number"
									min={1}
									max={questions.length}
									value={questionCount || ''}
									onChange={(e) =>
										setQuestionCount(
											e.target.value ? Number.parseInt(e.target.value, 10) : undefined
										)
									}
									placeholder="All"
								/>
								<p className="text-xs text-muted-foreground">
									Leave empty to use all selected questions
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor={timeLimitId} className="text-sm">
									Time limit (minutes)
								</Label>
								<Input
									id={timeLimitId}
									type="number"
									min={5}
									max={180}
									value={timeLimit}
									onChange={(e) => setTimeLimit(Number.parseInt(e.target.value, 10) || 30)}
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Switch
									id={shuffleId}
									checked={shuffleQuestions}
									onCheckedChange={setShuffleQuestions}
								/>
								<Label htmlFor={shuffleId} className="text-sm">
									Shuffle questions
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id={feedbackId}
									checked={showImmediateFeedback}
									onCheckedChange={setShowImmediateFeedback}
								/>
								<Label htmlFor={feedbackId} className="text-sm">
									Show immediate feedback
								</Label>
							</div>
						</div>
					</Card>

					<div className="flex justify-end gap-2">
						{onCancel && (
							<Button variant="outline" onClick={onCancel}>
								Go back
							</Button>
						)}
						<Button onClick={generateQuiz} disabled={isGenerating || selectedIds.length === 0}>
							{isGenerating ? (
								<>
									<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
									Generating...
								</>
							) : (
								'Generate quiz'
							)}
						</Button>
					</div>
				</>
			)}

			{isLoadingQuestions && (
				<div className="flex items-center justify-center py-8">
					<HugeiconsIcon
						icon={Loading03Icon}
						className="w-6 h-6 animate-spin text-muted-foreground"
					/>
				</div>
			)}
		</div>
	);
}
