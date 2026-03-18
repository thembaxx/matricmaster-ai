'use client';

import { Layers01Icon, Mic02Icon, Quiz01Icon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';

interface SolutionActionsProps {
	onSaveFlashcard: () => void;
	onGenerateQuiz: () => void;
	onListen: () => void;
	onVoiceTutor: () => void;
	isSavingFlashcard: boolean;
	isGeneratingQuiz: boolean;
}

export const SolutionActions = memo(function SolutionActions({
	onSaveFlashcard,
	onGenerateQuiz,
	onListen,
	onVoiceTutor,
	isSavingFlashcard,
	isGeneratingQuiz,
}: SolutionActionsProps) {
	return (
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
			<Button variant="outline" size="sm" onClick={onListen} className="rounded-full gap-2">
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
	);
});

interface DoneButtonsProps {
	onSnapAnother: () => void;
	onDone: () => void;
}

export const DoneButtons = memo(function DoneButtons({ onSnapAnother, onDone }: DoneButtonsProps) {
	return (
		<div className="flex gap-3">
			<Button
				variant="outline"
				className="flex-1 rounded-full h-14 font-black uppercase text-[10px] tracking-widest"
				onClick={onSnapAnother}
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
	);
});
