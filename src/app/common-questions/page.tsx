'use client';

import { FluentEmoji } from '@lobehub/fluent-emoji';
import { useState } from 'react';
import { QuestionCard } from '@/components/CommonQuestions/QuestionCard';
import { QuestionDialog } from '@/components/CommonQuestions/QuestionDialog';
import { Button } from '@/components/ui/button';
import {
	COMMON_QUESTIONS,
	type CommonQuestion,
	SUBJECTS,
	type SubjectId,
} from '@/constants/common-questions';

export default function CommonQuestionsPage() {
	const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
	const [selectedQuestion, setSelectedQuestion] = useState<CommonQuestion | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [showHint, setShowHint] = useState(false);

	const filteredQuestions =
		selectedSubject === 'all'
			? COMMON_QUESTIONS
			: COMMON_QUESTIONS.filter((q) => q.subject === selectedSubject);

	const handleQuestionClick = (question: CommonQuestion) => {
		setSelectedQuestion(question);
		setSelectedAnswer(null);
		setShowAnswer(false);
		setShowHint(false);
		setDialogOpen(true);
	};

	const handleSelectAnswer = (answerId: string) => {
		if (!showAnswer) {
			setSelectedAnswer(answerId);
		}
	};

	const handleCheckAnswer = () => {
		setShowAnswer(true);
	};

	return (
		<div className="min-h-screen bg-background pb-40">
			<header className="px-6 pt-12 pb-6 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold mb-2">Common exam questions</h1>
					<p className="text-sm text-muted-foreground mb-6">
						Practice frequently asked questions from past NSC papers
					</p>

					<div className="flex flex-wrap gap-2">
						<Button
							variant={selectedSubject === 'all' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedSubject('all')}
							className="rounded-full"
						>
							All subjects
						</Button>
						{SUBJECTS.map((subject) => (
							<Button
								key={subject.id}
								variant={selectedSubject === subject.id ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSelectedSubject(subject.id)}
								className="rounded-full gap-2"
							>
								<FluentEmoji emoji={subject.fluentEmoji} size={16} className="w-4 h-4" />
								{subject.label}
							</Button>
						))}
					</div>
				</div>
			</header>

			<main className="px-6 py-6 max-w-4xl mx-auto">
				<p className="text-sm text-muted-foreground mb-4">{filteredQuestions.length} questions</p>

				<div className="space-y-4">
					{filteredQuestions.map((question, index) => (
						<QuestionCard
							key={question.id}
							question={question}
							index={index}
							onClick={handleQuestionClick}
						/>
					))}
				</div>
			</main>

			{selectedQuestion && (
				<QuestionDialog
					question={selectedQuestion}
					dialogOpen={dialogOpen}
					setDialogOpen={setDialogOpen}
					selectedAnswer={selectedAnswer}
					onSelectAnswer={handleSelectAnswer}
					showAnswer={showAnswer}
					onCheckAnswer={handleCheckAnswer}
					showHint={showHint}
					onToggleHint={() => setShowHint(!showHint)}
				/>
			)}
		</div>
	);
}
