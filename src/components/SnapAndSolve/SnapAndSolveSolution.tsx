'use client';

import {
	Layers01Icon,
	Mic02Icon,
	Quiz01Icon,
	SparklesIcon,
	VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SnapAndSolveSolutionProps {
	solution: string;
	isSavingFlashcard: boolean;
	isGeneratingQuiz: boolean;
	onSaveFlashcard: () => void;
	onGenerateQuiz: () => void;
	onShowAudio: () => void;
	onVoiceTutor: () => void;
	onReset: () => void;
	onDone: () => void;
}

export function SnapAndSolveSolution({
	solution,
	isSavingFlashcard,
	isGeneratingQuiz,
	onSaveFlashcard,
	onGenerateQuiz,
	onShowAudio,
	onVoiceTutor,
	onReset,
	onDone,
}: SnapAndSolveSolutionProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="w-full space-y-6"
		>
			<div className="flex items-center gap-2">
				<div className="p-1.5 bg-success/10 rounded-lg">
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-success" />
				</div>
				<span className="text-[10px] font-black text-success uppercase tracking-widest">
					Step-by-Step Solution
				</span>
			</div>
			<Card className="rounded-[2.5rem] p-8 border border-border shadow-tiimo bg-card/50 backdrop-blur-sm overflow-hidden relative">
				<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
				<div className="flex flex-wrap justify-end gap-2 mb-4">
					<Button
						variant="outline"
						size="sm"
						disabled={isSavingFlashcard}
						onClick={onSaveFlashcard}
						className="rounded-full gap-2 hover:bg-tiimo-lavender/10 hover:text-tiimo-lavender border-dashed"
					>
						<HugeiconsIcon icon={Layers01Icon} className="w-4 h-4" />
						{isSavingFlashcard ? 'Saving...' : 'Add to Flashcards'}
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={isGeneratingQuiz}
						onClick={onGenerateQuiz}
						className="rounded-full gap-2 hover:bg-tiimo-green/10 hover:text-tiimo-green border-dashed"
					>
						<HugeiconsIcon icon={Quiz01Icon} className="w-4 h-4" />
						{isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
					</Button>
					<Button variant="outline" size="sm" onClick={onShowAudio} className="rounded-full gap-2">
						<HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
						Listen
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onVoiceTutor}
						className="rounded-full gap-2 hover:bg-tiimo-orange/10 hover:text-tiimo-orange border-dashed"
					>
						<HugeiconsIcon icon={Mic02Icon} className="w-4 h-4" />
						Explain with Voice
					</Button>
				</div>
				<MarkdownRenderer content={solution} />
			</Card>

			<div className="flex gap-3">
				<Button
					variant="outline"
					className="flex-1 rounded-full h-14 font-black uppercase text-[10px] tracking-widest"
					onClick={onReset}
				>
					Snap Another
				</Button>
				<Button
					className="flex-1 rounded-full h-14 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
					onClick={onDone}
				>
					Done
				</Button>
			</div>
		</m.div>
	);
}
