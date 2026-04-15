'use client';

import { MessageIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAiContext } from '@/hooks/useAiContext';
import { cn } from '@/lib/utils';

interface ContextualAIBubbleProps {
	className?: string;
}

export function ContextualAIBubble({ className }: ContextualAIBubbleProps) {
	const router = useRouter();
	const { context } = useAiContext();

	const handleClick = useCallback(() => {
		if (context.type === 'idle') {
			router.push('/ai-tutor');
			return;
		}

		const subject = context.subject || '';
		const topic = context.topic || '';
		const questionId = context.questionId || '';
		const paperId = context.paperId || '';
		const lessonId = context.lessonId || '';

		let contextPrompt = '';
		switch (context.type) {
			case 'lesson':
				contextPrompt = `I'm studying${topic ? ` ${topic}` : ''}${subject ? ` in ${subject}` : ''}${lessonId ? ` (lesson: ${lessonId})` : ''}. `;
				break;
			case 'pastPaper':
				contextPrompt = `I'm working on a past paper${subject ? ` in ${subject}` : ''}${topic ? ` (topic: ${topic})` : ''}${paperId ? ` (paper: ${paperId})` : ''}${questionId ? ` (question: ${questionId})` : ''}. `;
				break;
			case 'quiz':
				contextPrompt = `I'm taking a quiz${subject ? ` on ${subject}` : ''}${topic ? ` (topic: ${topic})` : ''}${questionId ? ` (question: ${questionId})` : ''}. `;
				break;
			case 'flashcard':
				contextPrompt = `I'm reviewing flashcards${topic ? ` on ${topic}` : ''}${subject ? ` in ${subject}` : ''}. `;
				break;
			default:
				contextPrompt = '';
		}

		router.push(`/ai-tutor?context=${encodeURIComponent(contextPrompt)}`);
	}, [context, router]);

	return (
		<div className={cn('fixed bottom-24 right-4 md:bottom-28 md:right-6 z-40', className)}>
			<Button
				onClick={handleClick}
				size="icon"
				className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/20 border border-border/50 backdrop-blur-xl bg-background/80 hover:bg-background transition-all hover:scale-110 active:scale-95"
			>
				<HugeiconsIcon
					icon={context.type !== 'idle' ? SparklesIcon : MessageIcon}
					className={cn(
						'h-6 w-6 text-slate-600',
						context.type !== 'idle' ? 'text-brand-blue fill-brand-blue' : 'text-slated-600 fill-slate-600',
					)}
				/>
			</Button>
		</div>
	);
}
