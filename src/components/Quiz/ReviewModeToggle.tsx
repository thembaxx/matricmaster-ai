'use client';

import { AlertCircle, Brain, Clock, RefreshCw } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getQuizQuestionsForReview } from '@/services/spacedRepetition';

interface ReviewModeToggleProps {
	onReviewModeChange: (isReviewMode: boolean) => void;
	disabled?: boolean;
}

export function ReviewModeToggle({ onReviewModeChange, disabled = false }: ReviewModeToggleProps) {
	const [isReviewMode, setIsReviewMode] = useState(false);
	const [loading, setLoading] = useState(false);
	const switchId = useId();

	const handleToggle = async (checked: boolean) => {
		if (checked) {
			setLoading(true);
			try {
				const reviewQuestions = await getQuizQuestionsForReview(10);
				if (reviewQuestions.length === 0) {
					toast.info('No questions due for review. Keep practicing!');
					setIsReviewMode(false);
					onReviewModeChange(false);
					return;
				}
				toast.success(`Found ${reviewQuestions.length} questions due for review`);
			} catch (error) {
				console.error('Error loading review questions:', error);
				toast.error('Failed to load review questions');
				return;
			} finally {
				setLoading(false);
			}
		}
		setIsReviewMode(checked);
		onReviewModeChange(checked);
	};

	return (
		<Card className="p-4 bg-muted/30">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
						<RefreshCw className="h-5 w-5 text-primary" />
					</div>
					<div>
						<Label htmlFor="review-mode" className="font-medium">
							Review Mode
						</Label>
						<p className="text-sm text-muted-foreground">
							Review questions based on spaced repetition
						</p>
					</div>
				</div>
				<Switch
					id={switchId}
					checked={isReviewMode}
					onCheckedChange={handleToggle}
					disabled={disabled || loading}
				/>
			</div>
			{isReviewMode && (
				<div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						<Brain className="h-4 w-4" />
						<span>Prioritizes forgotten concepts</span>
					</div>
					<div className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						<span>Adaptive intervals</span>
					</div>
					<div className="flex items-center gap-1">
						<AlertCircle className="h-4 w-4" />
						<span>Tracks weak topics</span>
					</div>
				</div>
			)}
		</Card>
	);
}

interface ReviewModeBadgeProps {
	questionCount: number;
}

export function ReviewModeBadge({ questionCount }: ReviewModeBadgeProps) {
	return (
		<div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
			<RefreshCw className="h-4 w-4" />
			<span>
				{questionCount} question{questionCount !== 1 ? 's' : ''} due for review
			</span>
		</div>
	);
}

export function getReviewModeStats() {
	return {
		icon: RefreshCw,
		label: 'Review Mode',
		description: 'Questions scheduled for spaced repetition review',
	};
}
