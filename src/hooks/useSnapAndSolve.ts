'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';
import { saveToFlashcardsAction } from '@/lib/db/flashcard-actions';
import { useAiContextStore } from '@/stores/useAiContextStore';

export function useSnapAndSolve() {
	const router = useRouter();
	const { aiLanguage } = useSettings();
	const setContext = useAiContextStore((state) => state.setContext);
	const [image, setImage] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [subject, setSubject] = useState('General');
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [solution, setSolution] = useState<string | null>(null);
	const [extractedQuestions, setExtractedQuestions] = useState<string[] | null>(null);
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
		} catch (error) {
			console.error('Failed to save flashcard:', error);
			toast.error('Something went wrong');
		} finally {
			setIsSavingFlashcard(false);
		}
	};

	const handleGenerateQuiz = async () => {
		if (!solution) return;

		setIsGeneratingQuiz(true);
		try {
			const response = await fetch('/api/quiz/generate-from-solution', {
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
		} catch (error) {
			console.error('Failed to generate quiz:', error);
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
		formData.append('language', aiLanguage);

		try {
			const response = await fetch('/api/snap-and-solve', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();
			if (data.solution) {
				setSolution(data.solution);
				setExtractedQuestions(data.questions || null);
				setContext({
					type: 'snapAndSolve',
					subject: subject,
					metadata: {
						subjectName: subject,
						solutionPreview: data.solution.substring(0, 200),
						extractedOcr: data.ocrText || '',
						extractedQuestions: data.questions || [],
					},
					isProactive: true,
				});
				toast.success('Question analyzed successfully!');
			} else {
				toast.error(data.error || 'Failed to analyze question');
			}
		} catch (error) {
			console.debug('Analysis failed:', error);
			toast.error('Something went wrong. Please try again.');
		} finally {
			setIsAnalyzing(false);
		}
	};

	const resetSession = () => {
		setPreview(null);
		setImage(null);
		setSolution(null);
		setExtractedQuestions(null);
	};

	return {
		router,
		image,
		setImage,
		preview,
		setPreview,
		subject,
		setSubject,
		isAnalyzing,
		solution,
		setSolution,
		extractedQuestions,
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
	};
}
