'use client';

import {
	ArrowRight01Icon,
	Chat01Icon,
	CheckmarkCircle02Icon,
	Idea01Icon,
	Loading03Icon,
	SparklesIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface GradingResult {
	totalScore: number;
	breakdown: {
		content: number;
		structure: number;
		argument: number;
		language: number;
	};
	strengths: string[];
	improvements: string[];
	detailedFeedback: string;
	suggestedGrade: string;
}

const SUBJECTS = [
	'English Home Language',
	'English First Additional Language',
	'Afrikaans Home Language',
	'Afrikaans First Additional Language',
	'History',
	'Geography',
	'Life Sciences',
	'Business Studies',
	'Accounting',
	'Other',
];

export default function EssayGraderPage() {
	const [topic, setTopic] = useState('');
	const [subject, setSubject] = useState('');
	const [essay, setEssay] = useState('');
	const [isGrading, setIsGrading] = useState(false);
	const [result, setResult] = useState<GradingResult | null>(null);

	const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

	const handleSubmit = async () => {
		if (!topic.trim()) {
			toast.error('Please enter the essay topic/question');
			return;
		}
		if (!essay.trim() || wordCount < 100) {
			toast.error('Please write at least 100 words');
			return;
		}

		setIsGrading(true);
		try {
			const response = await fetch('/api/ai-tutor/essay-grader', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic,
					subject,
					essay,
					wordCount,
				}),
			});

			const data = await response.json();

			if (data.grading) {
				setResult(data.grading);
				toast.success('Essay graded successfully!');
			} else {
				toast.error(data.error || 'Failed to grade essay');
			}
		} catch (_error) {
			toast.error('Failed to grade essay. Please try again.');
		} finally {
			setIsGrading(false);
		}
	};

	const getGradeColor = (score: number) => {
		if (score >= 80) return 'text-green-500';
		if (score >= 60) return 'text-blue-500';
		if (score >= 40) return 'text-yellow-500';
		return 'text-red-500';
	};

	const getGradeBadge = (grade: string) => {
		const colors: Record<string, string> = {
			'A+': 'bg-green-500',
			A: 'bg-green-500',
			'B+': 'bg-blue-500',
			B: 'bg-blue-500',
			'C+': 'bg-yellow-500',
			C: 'bg-yellow-500',
			D: 'bg-orange-500',
			E: 'bg-red-500',
			F: 'bg-red-500',
		};
		return colors[grade] || 'bg-gray-500';
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
						<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold mb-2">AI Essay Grader</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						Submit your practice essays and get instant AI-powered feedback
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Write Your Essay</CardTitle>
							<CardDescription>
								Practice makes perfect! Write about the topic below.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label htmlFor="essay-topic" className="text-sm font-medium">
									Topic / Question
								</label>
								<Input
									id="essay-topic"
									placeholder="e.g., Discuss the impact of climate change on South Africa"
									value={topic}
									onChange={(e) => setTopic(e.target.value)}
									className="mt-1"
								/>
							</div>

							<div>
								<label htmlFor="essay-subject" className="text-sm font-medium">
									Subject (Optional)
								</label>
								<Select value={subject} onValueChange={setSubject}>
									<SelectTrigger id="essay-subject" className="mt-1">
										<SelectValue placeholder="Select subject" />
									</SelectTrigger>
									<SelectContent>
										{SUBJECTS.map((s) => (
											<SelectItem key={s} value={s}>
												{s}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<div className="flex justify-between items-center mb-1">
									<label htmlFor="essay-content" className="text-sm font-medium">
										Your Essay
									</label>
									<Badge variant="outline">{wordCount} words</Badge>
								</div>
								<Textarea
									id="essay-content"
									placeholder="Start writing your essay here..."
									value={essay}
									onChange={(e) => setEssay(e.target.value)}
									className="min-h-[300px] resize-none focus:ring-2 focus:ring-primary"
								/>
							</div>

							<Button
								className="w-full"
								onClick={handleSubmit}
								disabled={isGrading || wordCount < 100}
							>
								{isGrading ? (
									<>
										<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
										Grading your essay...
									</>
								) : (
									<>
										<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-2" />
										Grade My Essay
									</>
								)}
							</Button>
						</CardContent>
					</Card>

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
												{result.strengths.map((strength, idx) => (
													<li key={idx} className="text-sm text-muted-foreground flex gap-2">
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
												{result.improvements.map((improvement, idx) => (
													<li key={idx} className="text-sm text-muted-foreground flex gap-2">
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

									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											setResult(null);
											setEssay('');
											setTopic('');
										}}
									>
										Try Another Essay
										<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<Card className="mt-6 bg-muted/50">
					<CardContent className="p-6">
						<h3 className="font-semibold mb-3">Tips for Better Essays</h3>
						<div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
							<div className="flex gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
								/>
								<p>Always plan your essay before writing</p>
							</div>
							<div className="flex gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
								/>
								<p>Use the PEEL method (Point, Evidence, Explain, Link)</p>
							</div>
							<div className="flex gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
								/>
								<p>Proofread for grammar and spelling errors</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
