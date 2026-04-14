'use client';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReportIncorrectAnswerButtonProps {
	content: string;
	question?: string;
	subject?: string;
	variant?: 'ghost' | 'outline' | 'default';
	size?: 'icon' | 'sm' | 'default' | 'lg';
	className?: string;
}

export function ReportIncorrectAnswerButton({
	content,
	question,
	subject,
	variant = 'ghost',
	size = 'icon',
	className,
}: ReportIncorrectAnswerButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [explanation, setExplanation] = useState('');

	const sizeClasses = {
		icon: 'h-8 w-8',
		sm: 'h-8 px-2 text-xs',
		default: 'h-9 px-4',
		lg: 'h-11 px-6',
	};

	const handleSubmit = async () => {
		if (!content) {
			toast.error('No content to report');
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch('/api/wrong-answer-pipeline', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: 'create',
					wrongAnswer: {
						question: question || 'AI Tutor explanation reported',
						correctAnswer: content,
						explanation: explanation || 'Marked as incorrect by user',
						subject: subject || 'General',
						userExplanation: explanation,
					},
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to submit report');
			}

			toast.success('Thanks! Your feedback helps us improve');
			setIsOpen(false);
			setExplanation('');
		} catch (error) {
			console.error('Failed to report incorrect answer:', error);
			toast.error('Failed to submit report. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant={variant}
					size={size === 'icon' ? 'icon' : 'default'}
					className={cn(
						'transition-colors text-muted-foreground hover:text-destructive hover:bg-destructive/10',
						sizeClasses[size],
						className
					)}
					title="Report incorrect answer"
				>
					<HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-destructive" />
						Report Incorrect Answer
					</DialogTitle>
					<DialogDescription>
						Help us improve by reporting AI answers that are wrong or misleading. Your feedback is
						reviewed by our team.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{content && (
						<div className="rounded-lg bg-muted p-3 text-sm">
							<p className="font-medium text-muted-foreground mb-1">AI Answer:</p>
							<p className="line-clamp-3">{content}</p>
						</div>
					)}

					<div className="space-y-2">
						<label htmlFor="explanation" className="text-sm font-medium">
							Why is this incorrect? (optional but helpful)
						</label>
						<Textarea
							id="explanation"
							placeholder="e.g., The formula used is wrong, The answer doesn't match the working..."
							value={explanation}
							onChange={(e) => setExplanation(e.target.value)}
							className="min-h-[100px]"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="gap-2"
					>
						{isSubmitting ? 'Submitting...' : 'Submit Report'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
