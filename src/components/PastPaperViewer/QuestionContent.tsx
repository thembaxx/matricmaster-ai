'use client';

import {
	BookOpen01Icon,
	Loading03Icon,
	SparklesIcon,
	VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { VoiceExplanation } from '@/components/AI/VoiceExplanation';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ExtractedQuestion } from './useQuestionViewer';

interface QuestionContentProps {
	question: ExtractedQuestion;
	showAiExplanation: boolean;
	aiExplanation: string | null;
	isExplaining: boolean;
	isSavingToFlashcards: boolean;
	onExplain: () => void;
	onSaveToFlashcards: () => void;
}

export function QuestionContent({
	question,
	showAiExplanation,
	aiExplanation,
	isExplaining,
	isSavingToFlashcards,
	onExplain,
	onSaveToFlashcards,
}: QuestionContentProps) {
	const [showAudioPlayer, setShowAudioPlayer] = useState(false);
	const [audioText, setAudioText] = useState('');
	const [audioTitle, setAudioTitle] = useState('');

	const handlePlayAudio = () => {
		setAudioText(question.questionText);
		setAudioTitle(`Question ${question.questionNumber}`);
		setShowAudioPlayer(true);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 items-start mb-6 relative z-10">
				<div className="flex items-center gap-4">
					<Badge className="bg-brand-blue text-white rounded-lg px-3 py-1.5 text-[10px]">
						QUESTION {question.questionNumber}
					</Badge>
					<p className="text-[10px] font-bold text-muted-foreground  tracking-wider">
						({question.marks} marks)
					</p>
				</div>

				{question.topic && (
					<Badge variant="outline" className="rounded-full text-xs bg-card">
						<span className="line-clamp-1">{question.topic}</span>
					</Badge>
				)}
			</div>

			<div className="flex items-start gap-3">
				<p className="flex-1 text-lg leading-relaxed">{question.questionText}</p>
				<Button
					variant="ghost"
					size="icon"
					onClick={handlePlayAudio}
					className="shrink-0 rounded-full h-9 w-9"
					title="Listen to question"
				>
					<HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
				</Button>
			</div>

			{question.subQuestions && question.subQuestions.length > 0 && (
				<div className="space-y-4 ml-2 mt-6 pt-4 border-t border-border">
					{question.subQuestions.map((sq) => (
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

			<div className="mt-8 pt-6 border-t border-border">
				<div className="grid grid-cols-2 gap-3">
					<Button
						variant="outline"
						className="border-brand-blue/20 hover:bg-brand-blue/5 text-sm"
						onClick={onExplain}
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
						onClick={onSaveToFlashcards}
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

			{showAudioPlayer && (
				<ResponsiveAudioPlayer
					text={audioText}
					title={audioTitle}
					open={showAudioPlayer}
					onOpenChange={setShowAudioPlayer}
				/>
			)}
		</div>
	);
}
