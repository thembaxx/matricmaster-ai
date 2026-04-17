'use client';

import { BookIcon, ClockIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { NSC_SUPPORTED_SUBJECTS, SUBJECTS } from '@/content';

interface ExamBuilderProps {
	userId: string;
}

interface ExamConfig {
	subject: string;
	papers: string[];
	questionCount: number;
	timeLimit: number;
	fullPaperMode: boolean;
	includeWeakTopics: boolean;
}

const PAPER_OPTIONS = [
	{ id: 'p1', name: 'Paper 1', description: 'Multiple choice questions' },
	{ id: 'p2', name: 'Paper 2', description: 'Short questions' },
	{ id: 'p3', name: 'Paper 3', description: 'Long questions/Essay' },
];

const TIME_LIMITS = [
	{ value: 60, label: '1 hour' },
	{ value: 120, label: '2 hours' },
	{ value: 180, label: '3 hours' },
];

const QUESTION_COUNTS = [10, 20, 30, 40, 50];

export default function ExamBuilder(_props: ExamBuilderProps) {
	const router = useRouter();
	const [config, setConfig] = useState<ExamConfig>({
		subject: '',
		papers: ['p1'],
		questionCount: 20,
		timeLimit: 120,
		fullPaperMode: false,
		includeWeakTopics: false,
	});
	const [isCreating, setIsCreating] = useState(false);

	const handleSubjectChange = (subject: string) => {
		setConfig((prev) => ({ ...prev, subject }));
	};

	const handlePaperToggle = (paperId: string) => {
		setConfig((prev) => {
			const papers = prev.papers.includes(paperId)
				? prev.papers.filter((p) => p !== paperId)
				: [...prev.papers, paperId];
			return { ...prev, papers };
		});
	};

	const handleStartExam = async () => {
		if (!config.subject || config.papers.length === 0) return;

		setIsCreating(true);

		try {
			const examId = `exam-${config.subject}-${Date.now()}`;
			const params = new URLSearchParams({
				id: examId,
				subject: config.subject,
				papers: config.papers.join(','),
				questions: config.fullPaperMode ? 'all' : String(config.questionCount),
				time: String(config.timeLimit),
				weakTopics: config.includeWeakTopics ? '1' : '0',
			});

			router.push(`/exam-runner/${examId}?${params.toString()}`);
		} catch (error) {
			console.error('Failed to create exam:', error);
			setIsCreating(false);
		}
	};

	const availableSubjects = NSC_SUPPORTED_SUBJECTS.map((id) => SUBJECTS[id]).filter(Boolean);

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-2xl mx-auto space-y-6">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
						<HugeiconsIcon icon={BookIcon} className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-display font-bold mb-2">Exam Builder</h1>
					<p className="text-muted-foreground">
						Create a custom exam simulation to practice under real conditions
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={BookIcon} className="w-5 h-5" />
							Select Subject
						</CardTitle>
						<CardDescription>Choose the subject you want to practice</CardDescription>
					</CardHeader>
					<CardContent>
						<Select value={config.subject} onValueChange={handleSubjectChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a subject" />
							</SelectTrigger>
							<SelectContent>
								{availableSubjects.map((subject) => (
									<SelectItem key={subject.id} value={subject.id}>
										<span className="mr-2">{subject.emoji}</span>
										{subject.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={BookIcon} className="w-5 h-5" />
							Select Papers
						</CardTitle>
						<CardDescription>Choose one or more papers to include</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{PAPER_OPTIONS.map((paper) => (
							<div
								key={paper.id}
								className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
								onClick={() => handlePaperToggle(paper.id)}
							>
								<Checkbox
									checked={config.papers.includes(paper.id)}
									onCheckedChange={() => handlePaperToggle(paper.id)}
								/>
								<div className="flex-1">
									<p className="font-medium">{paper.name}</p>
									<p className="text-sm text-muted-foreground">{paper.description}</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={ClockIcon} className="w-5 h-5" />
							Time Limit
						</CardTitle>
						<CardDescription>Set how long the exam will be</CardDescription>
					</CardHeader>
					<CardContent>
						<RadioGroup
							value={String(config.timeLimit)}
							onValueChange={(v) => setConfig((prev) => ({ ...prev, timeLimit: Number(v) }))}
							className="grid grid-cols-3 gap-4"
						>
							{TIME_LIMITS.map((option) => (
								<div key={option.value} className="flex items-center">
									<RadioGroupItem value={String(option.value)} id={String(option.value)} />
									<Label htmlFor={String(option.value)} className="ml-2 cursor-pointer">
										{option.label}
									</Label>
								</div>
							))}
						</RadioGroup>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Question Mode</CardTitle>
						<CardDescription>Choose how many questions to include</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between p-3 rounded-lg border">
							<div>
								<p className="font-medium">Full Paper Mode</p>
								<p className="text-sm text-muted-foreground">
									Include all questions from selected papers
								</p>
							</div>
							<Switch
								checked={config.fullPaperMode}
								onCheckedChange={(checked) =>
									setConfig((prev) => ({ ...prev, fullPaperMode: checked }))
								}
							/>
						</div>

						{!config.fullPaperMode && (
							<div className="space-y-2">
								<Label>Number of Questions</Label>
								<Select
									value={String(config.questionCount)}
									onValueChange={(v) =>
										setConfig((prev) => ({ ...prev, questionCount: Number(v) }))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{QUESTION_COUNTS.map((count) => (
											<SelectItem key={count} value={String(count)}>
												{count} questions
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Focus Areas</CardTitle>
						<CardDescription>Add additional weighting to areas needing improvement</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between p-3 rounded-lg border">
							<div>
								<p className="font-medium">Include Weak Topics</p>
								<p className="text-sm text-muted-foreground">
									Prioritize questions from topics you struggle with
								</p>
							</div>
							<Switch
								checked={config.includeWeakTopics}
								onCheckedChange={(checked) =>
									setConfig((prev) => ({ ...prev, includeWeakTopics: checked }))
								}
							/>
						</div>
					</CardContent>
				</Card>

				<Button
					size="lg"
					className="w-full"
					disabled={!config.subject || config.papers.length === 0 || isCreating}
					onClick={handleStartExam}
				>
					{isCreating ? 'Creating Exam...' : 'Start Exam'}
				</Button>

				<p className="text-center text-sm text-muted-foreground">
					Once started, you cannot exit until the timer ends or you submit
				</p>
			</div>
		</div>
	);
}
