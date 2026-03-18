'use client';

import { useRouter } from 'next/navigation';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { SnapAndSolveAnalysis } from '@/components/SnapAndSolve/SnapAndSolveAnalysis';
import { SnapAndSolveHeader } from '@/components/SnapAndSolve/SnapAndSolveHeader';
import { SnapAndSolveImageUploader } from '@/components/SnapAndSolve/SnapAndSolveImageUploader';
import { SnapAndSolveSolution } from '@/components/SnapAndSolve/SnapAndSolveSolution';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSnapAndSolve } from '@/hooks/useSnapAndSolve';
import { useAiContextStore } from '@/stores/useAiContextStore';

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Accounting',
	'Economics',
	'General',
];

export default function SnapAndSolve() {
	const router = useRouter();
	const setContext = useAiContextStore((state) => state.setContext);
	const {
		preview,
		subject,
		setSubject,
		isAnalyzing,
		solution,
		showAudioPlayer,
		setShowAudioPlayer,
		isSavingFlashcard,
		isGeneratingQuiz,
		fileInputRef,
		handleImageChange,
		handleAnalyze,
		handleSaveFlashcard,
		handleGenerateQuiz,
		resetSession,
	} = useSnapAndSolve();

	const handleVoiceTutor = () => {
		setContext({
			type: 'voiceTutor',
			subject: subject,
			metadata: {
				subjectName: subject,
				questionText: solution || undefined,
			},
			isProactive: true,
		});
		router.push('/study-companion');
	};

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<SnapAndSolveHeader onBack={() => router.back()} />

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-2xl mx-auto w-full gap-8">
					{!preview && (
						<SnapAndSolveImageUploader
							fileInputRef={fileInputRef}
							onImageChange={handleImageChange}
						/>
					)}

					{preview && !solution && (
						<SnapAndSolveAnalysis
							preview={preview}
							onReset={resetSession}
							subject={subject}
							setSubject={setSubject}
							isAnalyzing={isAnalyzing}
							onAnalyze={handleAnalyze}
							subjects={SUBJECTS}
						/>
					)}

					{solution && (
						<SnapAndSolveSolution
							solution={solution}
							isSavingFlashcard={isSavingFlashcard}
							isGeneratingQuiz={isGeneratingQuiz}
							onSaveFlashcard={handleSaveFlashcard}
							onGenerateQuiz={handleGenerateQuiz}
							onShowAudio={() => setShowAudioPlayer(true)}
							onVoiceTutor={handleVoiceTutor}
							onReset={resetSession}
							onDone={() => router.push('/dashboard')}
						/>
					)}
				</main>

				{solution && (
					<ResponsiveAudioPlayer
						text={solution}
						title="Solution"
						open={showAudioPlayer}
						onOpenChange={setShowAudioPlayer}
					/>
				)}
			</ScrollArea>
		</div>
	);
}
