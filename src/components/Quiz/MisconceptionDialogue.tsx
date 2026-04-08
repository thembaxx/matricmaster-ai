'use client';

import { m } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useAiContext } from '@/hooks/useAiContext';

interface MisconceptionDialogueProps {
	questionText: string;
	userAnswer: string;
	correctAnswer: string;
	subject?: string;
	topic?: string;
	onDismiss: () => void;
}

export function MisconceptionDialogue({
	questionText,
	userAnswer,
	correctAnswer,
	subject,
	topic,
	onDismiss,
}: MisconceptionDialogueProps) {
	const [explanation, setExplanation] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const { addActivity } = useAiContext();

	const handleSubmit = useCallback(async () => {
		if (!explanation.trim()) return;
		setIsSubmitting(true);

		try {
			await fetch('/api/ai-tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: `I was confident but got this wrong. My reasoning was: "${explanation}". The question was: "${questionText}". I answered: "${userAnswer}" but the correct answer is: "${correctAnswer}". Help me understand my misconception.`,
					subject,
					history: [],
					includeSuggestions: false,
				}),
			});

			addActivity({
				type: 'quiz',
				subject,
				topic,
				outcome: 'failed',
				description: `Confident error on: ${questionText.slice(0, 50)}`,
			});

			setSubmitted(true);
		} catch {
			setSubmitted(true);
		} finally {
			setIsSubmitting(false);
		}
	}, [explanation, questionText, userAnswer, correctAnswer, subject, topic, addActivity]);

	return (
		<m.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -4 }}
			className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5"
		>
			<div className="flex items-center gap-2 mb-3">
				<div className="w-2 h-2 rounded-full bg-amber-500" />
				<span className="text-sm font-medium text-amber-800">
					you were confident but got this wrong
				</span>
			</div>
			<p className="text-xs text-amber-700 mb-3">
				explaining your reasoning helps identify misconceptions. what made you choose your answer?
			</p>
			{!submitted ? (
				<>
					<textarea
						value={explanation}
						onChange={(e) => setExplanation(e.target.value)}
						placeholder="I thought the answer was... because..."
						className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
						rows={2}
					/>
					<div className="flex items-center gap-2 mt-2">
						<button
							type="button"
							onClick={handleSubmit}
							disabled={!explanation.trim() || isSubmitting}
							className="px-4 py-1.5 text-xs font-medium rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'sending...' : 'submit explanation'}
						</button>
						<button
							type="button"
							onClick={onDismiss}
							className="px-4 py-1.5 text-xs font-medium rounded-full text-amber-700 hover:bg-amber-100 transition-colors"
						>
							skip
						</button>
					</div>
				</>
			) : (
				<p className="text-xs text-amber-700">
					thanks for sharing. the ai tutor will help you work through this.
				</p>
			)}
		</m.div>
	);
}
