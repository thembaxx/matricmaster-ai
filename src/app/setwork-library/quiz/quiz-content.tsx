'use client';

import { FlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { QuizEngine } from '@/components/SetworkLibrary/QuizEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { QuizQuestion, Setwork } from '@/content/setworks/types';

interface QuizContentProps {
	setworks: Setwork[];
	quizQuestions: QuizQuestion[];
}

function QuizContentInner({ setworks, quizQuestions }: QuizContentProps) {
	const searchParams = useSearchParams();
	const initialSetwork = searchParams.get('setwork') || 'all';

	const [selectedSetwork, setSelectedSetwork] = useState(initialSetwork);
	const [selectedDifficulty, setSelectedDifficulty] = useState('all');
	const [isStarted, setIsStarted] = useState(false);

	const filteredQuestions = quizQuestions.filter((q) => {
		const matchesSetwork = selectedSetwork === 'all' || q.setworkId === selectedSetwork;
		const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
		return matchesSetwork && matchesDifficulty;
	});

	if (isStarted && filteredQuestions.length > 0) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={() => setIsStarted(false)}>
						Back to settings
					</Button>
					<span className="text-sm text-muted-foreground">
						{filteredQuestions.length} questions
					</span>
				</div>
				<QuizEngine questions={filteredQuestions} />
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-lg mx-auto">
			<Card className="p-6 space-y-6">
				<div className="text-center space-y-2">
					<HugeiconsIcon icon={FlashIcon} className="w-10 h-10 text-primary mx-auto" />
					<h2 className="font-bold text-lg">Set your quiz</h2>
					<p className="text-sm text-muted-foreground">Choose a setwork and difficulty level</p>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">Setwork</p>
						<Select value={selectedSetwork} onValueChange={setSelectedSetwork}>
							<SelectTrigger aria-label="Select setwork">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All setworks</SelectItem>
								{setworks.map((s) => (
									<SelectItem key={s.id} value={s.id}>
										{s.title} ({s.targetLevel})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<p className="text-sm font-medium">Difficulty</p>
						<Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
							<SelectTrigger aria-label="Select difficulty">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All levels</SelectItem>
								<SelectItem value="easy">Easy</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="hard">Hard</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="text-center">
					<p className="text-sm text-muted-foreground mb-3">
						{filteredQuestions.length} question
						{filteredQuestions.length !== 1 ? 's' : ''} available
					</p>
					<Button
						onClick={() => setIsStarted(true)}
						disabled={filteredQuestions.length === 0}
						className="w-full"
					>
						Start Quiz
					</Button>
				</div>
			</Card>
		</div>
	);
}

function QuizContentSkeleton() {
	return (
		<div className="space-y-6 max-w-lg mx-auto">
			<div className="p-6 space-y-6">
				<div className="text-center space-y-2">
					<div className="w-10 h-10 bg-muted rounded mx-auto animate-pulse" />
					<div className="h-6 bg-muted rounded w-1/3 mx-auto animate-pulse" />
					<div className="h-4 bg-muted rounded w-2/3 mx-auto animate-pulse" />
				</div>
				<div className="space-y-4">
					<div className="h-16 bg-muted rounded animate-pulse" />
					<div className="h-16 bg-muted rounded animate-pulse" />
				</div>
			</div>
		</div>
	);
}

export function QuizContent({ setworks, quizQuestions }: QuizContentProps) {
	return (
		<Suspense fallback={<QuizContentSkeleton />}>
			<QuizContentInner setworks={setworks} quizQuestions={quizQuestions} />
		</Suspense>
	);
}
