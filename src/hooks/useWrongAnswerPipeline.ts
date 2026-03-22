'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { PipelineResult } from '@/services/wrongAnswerPipeline';
import {
	createFlashcardFromWrongAnswer,
	type WrongAnswerData,
} from '@/services/wrongAnswerPipeline';

export interface WrongAnswerEvent {
	questionId: string;
	questionText: string;
	correctAnswer: string;
	userAnswer?: string;
	explanation?: string;
	topic: string;
	subject: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UseWrongAnswerPipelineOptions {
	enabled?: boolean;
	onFlashcardCreated?: (result: PipelineResult) => void;
	onError?: (error: string) => void;
	showNotifications?: boolean;
}

export interface UseWrongAnswerPipelineReturn {
	processWrongAnswer: (wrongAnswer: WrongAnswerEvent) => Promise<PipelineResult>;
	processMultipleWrongAnswers: (wrongAnswers: WrongAnswerEvent[]) => Promise<number>;
	isProcessing: boolean;
	createdCount: number;
	autoGenerationEnabled: boolean;
	disableAutoGeneration: () => void;
	enableAutoGeneration: () => void;
}

const STORAGE_KEY = 'matricmaster_auto_flashcard_generation';

export function useWrongAnswerPipeline(
	options: UseWrongAnswerPipelineOptions = {}
): UseWrongAnswerPipelineReturn {
	const { enabled = true, onFlashcardCreated, onError, showNotifications = true } = options;

	const [isProcessing, setIsProcessing] = useState(false);
	const [createdCount, setCreatedCount] = useState(0);
	const [autoGenerationEnabled, setAutoGenerationEnabled] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored === null ? true : stored === 'true';
		}
		return true;
	});

	const disableAutoGeneration = useCallback(() => {
		setAutoGenerationEnabled(false);
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, 'false');
		}
	}, []);

	const enableAutoGeneration = useCallback(() => {
		setAutoGenerationEnabled(true);
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, 'true');
		}
	}, []);

	const processWrongAnswer = useCallback(
		async (wrongAnswer: WrongAnswerEvent): Promise<PipelineResult> => {
			if (!enabled) {
				return { success: false, error: 'Pipeline disabled' };
			}

			setIsProcessing(true);

			try {
				const data: WrongAnswerData = {
					questionId: wrongAnswer.questionId,
					questionText: wrongAnswer.questionText,
					correctAnswer: wrongAnswer.correctAnswer,
					userAnswer: wrongAnswer.userAnswer,
					explanation: wrongAnswer.explanation,
					topic: wrongAnswer.topic,
					subject: wrongAnswer.subject,
					difficulty: wrongAnswer.difficulty,
				};

				const result = await createFlashcardFromWrongAnswer(data);

				if (result.success && result.flashcardId) {
					setCreatedCount((prev) => prev + 1);
					if (showNotifications) {
						toast.success('Quick flashcard created from your wrong answer');
					}
					onFlashcardCreated?.(result);
				} else if (result.error === 'duplicate' && showNotifications) {
					toast.info('Flashcard already exists for this question');
				} else if (!result.success && showNotifications) {
					toast.error('Could not create flashcard automatically', {
						description: 'You can create one manually',
						action: {
							label: 'Create',
							onClick: () => {
								// TODO: Open manual flashcard creation modal
							},
						},
					});
					onError?.(result.error || 'Unknown error');
				}

				return result;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				if (showNotifications) {
					toast.error('Failed to create flashcard', {
						description: errorMessage,
					});
				}
				onError?.(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setIsProcessing(false);
			}
		},
		[enabled, onFlashcardCreated, onError, showNotifications]
	);

	const processMultipleWrongAnswers = useCallback(
		async (wrongAnswers: WrongAnswerEvent[]): Promise<number> => {
			if (!enabled || wrongAnswers.length === 0) {
				return 0;
			}

			setIsProcessing(true);
			let totalCreated = 0;

			try {
				for (const wrongAnswer of wrongAnswers) {
					const result = await processWrongAnswer(wrongAnswer);
					if (result.success && result.flashcardId) {
						totalCreated++;
					}
				}

				if (showNotifications && totalCreated > 0) {
					toast.success(
						`${totalCreated} flashcard${totalCreated > 1 ? 's' : ''} created from this quiz`
					);
				}

				return totalCreated;
			} finally {
				setIsProcessing(false);
			}
		},
		[enabled, processWrongAnswer, showNotifications]
	);

	return {
		processWrongAnswer,
		processMultipleWrongAnswers,
		isProcessing,
		createdCount,
		autoGenerationEnabled,
		disableAutoGeneration,
		enableAutoGeneration,
	};
}
