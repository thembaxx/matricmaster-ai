'use client';

import { BookUploadIcon, TickDouble02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useState } from 'react';
import { addTutorWeakAreasToStudyPlan } from '@/actions/tutor-study-plan-bridge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AddToStudyPlanButtonProps {
	content: string;
	subject?: string | null;
	topic?: string;
	variant?: 'ghost' | 'outline';
	size?: 'icon' | 'sm';
}

/**
 * Bridge: AI Tutor → Study Plan
 * Button that extracts weak areas from an AI tutor message and adds them to the study plan.
 */
export function AddToStudyPlanButton({
	content,
	subject,
	topic,
	variant = 'ghost',
	size = 'icon',
}: AddToStudyPlanButtonProps) {
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

	const handleAdd = useCallback(async () => {
		if (status === 'loading' || status === 'success') return;

		setStatus('loading');

		try {
			// Extract the topic from the message or use provided topic
			const extractedTopic = topic || extractTopicFromContent(content);
			if (!extractedTopic) {
				setStatus('error');
				setTimeout(() => setStatus('idle'), 2000);
				return;
			}

			const result = await addTutorWeakAreasToStudyPlan([
				{
					topic: extractedTopic,
					subject: subject || 'General',
					confidence: 0.4,
				},
			]);

			if (result.success) {
				setStatus('success');
			} else {
				setStatus('error');
				setTimeout(() => setStatus('idle'), 2000);
			}
		} catch {
			setStatus('error');
			setTimeout(() => setStatus('idle'), 2000);
		}
	}, [content, subject, topic, status]);

	const icon = status === 'success' ? TickDouble02Icon : BookUploadIcon;
	const label =
		status === 'success'
			? 'Added to study plan'
			: status === 'error'
				? 'Failed to add'
				: 'Add to study plan';

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={variant}
						size={size}
						onClick={handleAdd}
						disabled={status === 'loading' || status === 'success'}
						className={cn(
							size === 'icon' && 'h-7 w-7 md:h-8 md:w-8',
							status === 'success' && 'text-green-500',
							status === 'error' && 'text-destructive'
						)}
					>
						<HugeiconsIcon
							icon={icon}
							className={cn('h-3.5 w-3.5 md:h-4 md:w-4', status === 'loading' && 'animate-spin')}
						/>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p className="text-xs">{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

function extractTopicFromContent(content: string): string | null {
	// Simple heuristic: look for topic patterns in AI responses
	const topicPatterns = [
		/topic[:\s]+([^\n,.]+)/i,
		/focus on[:\s]+([^\n,.]+)/i,
		/struggling with[:\s]+([^\n,.]+)/i,
		/practice[:\s]+([^\n,.]+)/i,
		/review[:\s]+([^\n,.]+)/i,
	];

	for (const pattern of topicPatterns) {
		const match = content.match(pattern);
		if (match?.[1]) {
			return match[1].trim().substring(0, 100);
		}
	}

	return null;
}
