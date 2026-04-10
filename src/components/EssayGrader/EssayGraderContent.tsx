'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { EssayInputForm } from './EssayInputForm';
import { EssayTips } from './EssayTips';
import { GradingFeedback } from './GradingFeedback';

type GradingStatus = 'idle' | 'grading' | 'done';

export function EssayGraderContent() {
	const [topic, setTopic] = useState('');
	const [subject, setSubject] = useState('');
	const [essay, setEssay] = useState('');
	const [status, setStatus] = useState<GradingStatus>('idle');
	const [feedback, setFeedback] = useState<string | null>(null);

	const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

	const handleSubmit = async () => {
		if (wordCount < 100) {
			toast.error('Please write at least 100 words');
			return;
		}

		setStatus('grading');

		try {
			const response = await fetch('/api/essay-grader', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic, subject, essay }),
			});

			if (!response.ok) {
				throw new Error('Grading failed');
			}

			const data = await response.json();
			setFeedback(data.feedback);
			setStatus('done');
		} catch (error) {
			console.error('Essay grading error:', error);
			toast.error('Failed to grade essay. Please try again.');
			setStatus('idle');
		}
	};

	if (status === 'done' && feedback) {
		return (
			<div className="p-6 space-y-6">
				<GradingFeedback feedback={feedback} onReset={() => setStatus('idle')} />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<EssayTips />
			<EssayInputForm
				topic={topic}
				setTopic={setTopic}
				subject={subject}
				setSubject={setSubject}
				essay={essay}
				setEssay={setEssay}
				wordCount={wordCount}
				isGrading={status === 'grading'}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
