'use client';

import {
	BookOpen01Icon,
	Loading03Icon,
	SparklesIcon,
	VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import { VoiceExplanation } from '@/components/AI/VoiceExplanation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PastPaperQuestionProps {
	currentQuestion: any;
	handleExplainQuestion: () => void;
	isExplaining: boolean;
	handleSaveToFlashcards: () => void;
	isSavingToFlashcards: boolean;
	showAiExplanation: boolean;
	aiExplanation: string | null;
	onListen: (text: string, title: string) => void;
}

export function PastPaperQuestion({
	currentQuestion,
	handleExplainQuestion,
	isExplaining,
	handleSaveToFlashcards,
	isSavingToFlashcards,
	showAiExplanation,
	aiExplanation,
	onListen,
}: PastPaperQuestionProps) {
	if (!currentQuestion) return null;

	return (
		<Card className="p-6 rounded-[2rem] border-none shadow-sm bg-card relative overflow-hidden">
			<div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale">
				<Image
					src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800"
					alt="Paper texture"
					fill
					sizes="(max-width: 768px) 100vw, 800px"
					className="object-cover"
				/>
			</div>

			{/* Question Header */}
			<div className="flex flex-col gap-3 items-start mb-6 relative z-10">
				<div className="flex items-center gap-4">
					<Badge className="bg-brand-blue text-white rounded-lg px-3 py-1.5 text-[10px]">
						QUESTION {currentQuestion.questionNumber}
					</Badge>
					<p className="text-[10px] font-bold text-muted-foreground  tracking-wider">
						({currentQuestion.marks} marks)
					</p>
				</div>

				{currentQuestion.topic && (
					<Badge variant="outline" className="rounded-full text-xs bg-card">
						<span className="line-clamp-1">{currentQuestion.topic}</span>
					</Badge>
				)}
			</div>

			{/* Main Question Text */}
			<div className="space-y-4 text-foreground font-medium relative z-10">
				<div className="flex items-start gap-3">
					<p className="flex-1 text-lg leading-relaxed">{currentQuestion.questionText}</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() =>
							onListen(currentQuestion.questionText, `Question ${currentQuestion.questionNumber}`)
						}
						className="shrink-0 rounded-full h-9 w-9"
						title="Listen to question"
					>
						<HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
					</Button>
				</div>

				{/* Sub-questions */}
				{currentQuestion.subQuestions && currentQuestion.subQuestions.length > 0 && (
					<div className="space-y-4 ml-2 mt-6 pt-4 border-t border-border">
						{currentQuestion.subQuestions.map((sq: any) => (
							<div key={sq.id} className="space-y-2">
								<p className="font-semibold text-sm text-foreground text-pretty">
									{sq.id}. {sq.text}
									{sq.marks && (
										<span className="text-xs text-muted-foreground ml-2">({sq.marks} marks)</span>
									)}
								</p>
							</div>
						))}
					</div>
				)}
			</div>

			{/* AI Explain Button */}
			<div className="mt-8 pt-6 border-t border-border relative z-10">
				<div className="grid grid-cols-2 gap-3">
					<Button
						variant="outline"
						className="border-brand-blue/20 hover:bg-brand-blue/5 text-sm"
						onClick={handleExplainQuestion}
						disabled={isExplaining}
					>
						{isExplaining ? (
							<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-2 text-brand-blue" />
						)}
						{isExplaining ? 'Getting...' : 'Explain'}
					</Button>
					<Button
						variant="outline"
						className="border-success/20 hover:bg-success/5 text-sm"
						onClick={handleSaveToFlashcards}
						disabled={isSavingToFlashcards}
					>
						{isSavingToFlashcards ? (
							<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 mr-2 text-success" />
						)}
						{isSavingToFlashcards ? 'Saving...' : 'Save to Flashcards'}
					</Button>
				</div>

				{/* AI Explanation Display */}
				{showAiExplanation && aiExplanation && (
					<div className="mt-4 p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl">
						<div className="flex items-center gap-2 mb-2">
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-brand-blue" />
							<span className="text-sm font-bold text-brand-blue">AI Explanation</span>
						</div>
						<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
							{aiExplanation}
						</p>
						<div className="mt-3">
							<VoiceExplanation text={aiExplanation} />
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}
