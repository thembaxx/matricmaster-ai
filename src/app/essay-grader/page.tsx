'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EssayInputForm } from '@/components/EssayGrader/EssayInputForm';
import { EssayTips } from '@/components/EssayGrader/EssayTips';
import { GradingFeedback } from '@/components/EssayGrader/GradingFeedback';
import type { GradingResult } from '@/components/EssayGrader/types';

export default function EssayGraderPage() {
	const [topic, setTopic] = useState('');
	const [subject, setSubject] = useState('');
	const [essay, setEssay] = useState('');
	const [isGrading, setIsGrading] = useState(false);
	const [result, setResult] = useState<GradingResult | null>(null);

	const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

	const handleSubmit = async () => {
		if (!topic.trim()) {
			toast.error('Please enter the essay topic/question');
			return;
		}
		if (!essay.trim() || wordCount < 100) {
			toast.error('Please write at least 100 words');
			return;
		}

		setIsGrading(true);
		try {
			const response = await fetch('/api/ai-tutor/essay-grader', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic,
					subject,
					essay,
					wordCount,
				}),
			});

			const data = await response.json();

			if (data.grading) {
				setResult(data.grading);
				toast.success('Essay graded successfully!');
			} else {
				toast.error(data.error || 'Failed to grade essay');
			}
		} catch (_error) {
			toast.error('Failed to grade essay. Please try again.');
		} finally {
			setIsGrading(false);
		}
	};

	const handleReset = () => {
		setResult(null);
		setEssay('');
		setTopic('');
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
						<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold mb-2">AI Essay Grader</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						Submit your practice essays and get instant AI-powered feedback
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<EssayInputForm
						topic={topic}
						setTopic={setTopic}
						subject={subject}
						setSubject={setSubject}
						essay={essay}
						setEssay={setEssay}
						wordCount={wordCount}
						isGrading={isGrading}
						onSubmit={handleSubmit}
					/>

					<GradingFeedback result={result} onReset={handleReset} />
				</div>

				<EssayTips />
			</div>
		</div>
	);
}
