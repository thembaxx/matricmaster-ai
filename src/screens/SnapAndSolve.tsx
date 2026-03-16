'use client';

import {
	ArrowLeft01Icon,
	Camera01Icon,
	Cancel01Icon,
	Layers01Icon,
	Loading03Icon,
	Microphone01Icon,
	Quiz01Icon,
	SparklesIcon,
	VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { SafeImage } from '@/components/SafeImage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { saveToFlashcardsAction } from '@/lib/db/flashcard-actions';
import { cn } from '@/lib/utils';
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
	const [image, setImage] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [subject, setSubject] = useState('General');
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [solution, setSolution] = useState<string | null>(null);
	const [showAudioPlayer, setShowAudioPlayer] = useState(false);
	const [isSavingFlashcard, setIsSavingFlashcard] = useState(false);
	const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
			setSolution(null);
		}
	};

	const handleSaveFlashcard = async () => {
		if (!solution) return;

		setIsSavingFlashcard(true);
		try {
			// Extract a brief summary for the front if possible
			const frontRaw = subject !== 'General' ? `${subject} Problem` : 'Snapped Question';
			const result = await saveToFlashcardsAction({
				front: frontRaw,
				back: solution,
				subjectName: subject,
			});

			if (result.success) {
				toast.success('Added to your Flashcards!', {
					description: 'You can review this in the Flashcards section.',
					action: {
						label: 'View',
						onClick: () => router.push('/flashcards'),
					},
				});
			} else {
				toast.error('Failed to save flashcard');
			}
		} catch {
			toast.error('Something went wrong');
		} finally {
			setIsSavingFlashcard(false);
		}
	};

	const handleGenerateQuiz = async () => {
		if (!solution) return;

		setIsGeneratingQuiz(true);
		try {
			// Generate a quiz based on the solution
			const response = await fetch('/api/generate-quiz-from-solution', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ solution, subject }),
			});

			const data = await response.json();
			if (data.quizId) {
				toast.success('Quiz generated!', {
					description: 'Test your understanding with this quiz.',
					action: {
						label: 'Take Quiz',
						onClick: () => router.push(`/quiz?id=${data.quizId}`),
					},
				});
			} else {
				toast.error('Failed to generate quiz');
			}
		} catch {
			toast.error('Something went wrong');
		} finally {
			setIsGeneratingQuiz(false);
		}
	};

	const handleAnalyze = async () => {
		if (!image) {
			toast.error('Please select or snap a photo of a question');
			return;
		}

		setIsAnalyzing(true);
		const formData = new FormData();
		formData.append('image', image);
		formData.append('subject', subject);

		try {
			const response = await fetch('/api/snap-and-solve', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();
			if (data.solution) {
				setSolution(data.solution);
				setContext({
					type: 'snapAndSolve',
					subject: subject,
					metadata: {
						subjectName: subject,
						solutionPreview: data.solution.substring(0, 200),
						extractedOcr: data.ocrText || '',
					},
					isProactive: true,
				});
				toast.success('Question analyzed successfully!');
			} else {
				toast.error(data.error || 'Failed to analyze question');
			}
		} catch (error) {
			console.error('Analysis failed:', error);
			toast.error('Something went wrong. Please try again.');
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-2xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-black uppercase tracking-tight">Snap & Solve</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-2xl mx-auto w-full gap-8">
					{!preview ? (
						<m.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="w-full aspect-square max-w-md bg-card rounded-[3rem] border-4 border-dashed border-border flex flex-col items-center justify-center p-12 text-center gap-6"
						>
							<div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
								<HugeiconsIcon icon={Camera01Icon} className="w-12 h-12" />
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-black uppercase tracking-tight">Snap your question</h3>
								<p className="text-sm text-muted-foreground font-medium">
									Take a clear photo of any textbook or handwritten question.
								</p>
							</div>
							<input
								type="file"
								accept="image/*"
								capture="environment"
								className="hidden"
								ref={fileInputRef}
								onChange={handleImageChange}
							/>
							<Button
								onClick={() => fileInputRef.current?.click()}
								className="rounded-full px-8 h-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
							>
								Open Camera
							</Button>
						</m.div>
					) : (
						<div className="w-full space-y-6">
							<div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border-4 border-card shadow-2xl">
								<SafeImage
									src={preview}
									alt="Question preview"
									className="w-full h-full object-cover"
								/>
								<button
									type="button"
									onClick={() => {
										setPreview(null);
										setImage(null);
										setSolution(null);
									}}
									className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center"
								>
									<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
								</button>
							</div>

							{!solution && (
								<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
									<div className="space-y-3">
										<p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
											Identify Subject
										</p>
										<div className="flex flex-wrap gap-2">
											{SUBJECTS.map((s) => (
												<button
													key={s}
													type="button"
													onClick={() => setSubject(s)}
													className={cn(
														'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
														subject === s
															? 'bg-primary text-white shadow-lg scale-105'
															: 'bg-card border border-border text-muted-foreground'
													)}
												>
													{s}
												</button>
											))}
										</div>
									</div>

									<Button
										onClick={handleAnalyze}
										disabled={isAnalyzing}
										className="w-full h-16 rounded-3xl font-black text-lg gap-2 shadow-2xl shadow-primary/30"
									>
										{isAnalyzing ? (
											<>
												<HugeiconsIcon icon={Loading03Icon} className="w-6 h-6 animate-spin" />
												Analyzing...
											</>
										) : (
											<>
												<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6" />
												Solve with AI
											</>
										)}
									</Button>
								</div>
							)}
						</div>
					)}

					{solution && (
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
								<div className="flex justify-end gap-2 mb-4">
									<Button
										variant="outline"
										size="sm"
										disabled={isSavingFlashcard}
										onClick={handleSaveFlashcard}
										className="rounded-full gap-2 hover:bg-tiimo-lavender/10 hover:text-tiimo-lavender border-dashed"
									>
										<HugeiconsIcon icon={Layers01Icon} className="w-4 h-4" />
										{isSavingFlashcard ? 'Saving...' : 'Add to Flashcards'}
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={isGeneratingQuiz}
										onClick={handleGenerateQuiz}
										className="rounded-full gap-2 hover:bg-tiimo-green/10 hover:text-tiimo-green border-dashed"
									>
										<HugeiconsIcon icon={Quiz01Icon} className="w-4 h-4" />
										{isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowAudioPlayer(true)}
										className="rounded-full gap-2"
									>
										<HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
										Listen
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
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
										}}
										className="rounded-full gap-2 hover:bg-tiimo-orange/10 hover:text-tiimo-orange border-dashed"
									>
										<HugeiconsIcon icon={Microphone01Icon} className="w-4 h-4" />
										Explain with Voice
									</Button>
								</div>
								<MarkdownRenderer content={solution} />
							</Card>

							<div className="flex gap-3">
								<Button
									variant="outline"
									className="flex-1 rounded-full h-14 font-black uppercase text-[10px] tracking-widest"
									onClick={() => {
										setPreview(null);
										setImage(null);
										setSolution(null);
									}}
								>
									Snap Another
								</Button>
								<Button
									className="flex-1 rounded-full h-14 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
									onClick={() => router.push('/dashboard')}
								>
									Done
								</Button>
							</div>
						</m.div>
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
