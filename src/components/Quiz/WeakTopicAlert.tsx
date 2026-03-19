'use client';

import {
	LightbulbOffIcon,
	RefreshIcon,
	SparklesIcon,
	Timer02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

interface WeakTopicAlertProps {
	topic: string;
	subject: string;
	score: number;
	onDismiss?: () => void;
	compact?: boolean;
}

export const WeakTopicAlert = memo(function WeakTopicAlert({
	topic,
	subject,
	score,
	onDismiss,
	compact = false,
}: WeakTopicAlertProps) {
	const router = useRouter();
	const [takenActions, setTakenActions] = useState<Set<string>>(new Set());
	const [isProcessing, setIsProcessing] = useState(false);

	const handleAction = useCallback(
		async (action: string) => {
			setIsProcessing(true);
			try {
				const response = await fetch('/api/adaptive-learning/process', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						action,
						topic,
						subject,
						subjectId: 1,
					}),
				});

				if (response.ok) {
					setTakenActions((prev) => new Set([...prev, action]));
				}
			} catch (error) {
				console.debug('[WeakTopicAlert] Action failed:', error);
			} finally {
				setIsProcessing(false);
			}
		},
		[topic, subject]
	);

	const handleAiTutor = useCallback(() => {
		router.push(`/tutoring/session?topic=${encodeURIComponent(topic)}&context=weak_topic`);
	}, [router, topic]);

	const handleScheduleReview = useCallback(() => {
		handleAction('schedule_review');
	}, [handleAction]);

	const handleGenerateFlashcards = useCallback(() => {
		handleAction('generate_flashcards');
	}, [handleAction]);

	const handleUpdatePath = useCallback(() => {
		handleAction('suggest_retake');
		router.push(`/study-path?topic=${encodeURIComponent(topic)}&suggested=true`);
	}, [handleAction, router, topic]);

	const percentage = Math.round(score * 100);
	const isCritical = score < 0.5;

	if (compact) {
		return (
			<m.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-destructive/10 border border-destructive/30 rounded-xl p-3"
			>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
						<HugeiconsIcon icon={LightbulbOffIcon} className="w-5 h-5 text-destructive" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="font-medium text-sm text-foreground truncate">Struggling with {topic}</p>
						<p className="text-xs text-muted-foreground">
							Score: <span className="font-mono font-medium">{percentage}%</span>
						</p>
					</div>
					<Button size="sm" variant="ghost" onClick={onDismiss}>
						Dismiss
					</Button>
				</div>
			</m.div>
		);
	}

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
		>
			<div className={`p-4 ${isCritical ? 'bg-destructive/5' : 'bg-warning/5'}`}>
				<div className="flex items-start gap-3">
					<div
						className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
							isCritical ? 'bg-destructive/20' : 'bg-warning/20'
						}`}
					>
						<HugeiconsIcon
							icon={LightbulbOffIcon}
							className={`w-6 h-6 ${isCritical ? 'text-destructive' : 'text-warning'}`}
						/>
					</div>
					<div className="flex-1">
						<h3 className="font-semibold text-foreground mb-1">
							We noticed you&apos;re struggling with {topic}
						</h3>
						<p className="text-sm text-muted-foreground">
							You scored{' '}
							<span className="font-mono font-medium text-foreground">{percentage}%</span> on this
							topic. Here are some ways to improve:
						</p>
					</div>
				</div>
			</div>

			<div className="p-4 space-y-3">
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-auto py-3 flex-col gap-1.5"
						onClick={handleAiTutor}
						disabled={isProcessing}
					>
						<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
						<span className="text-xs font-medium">Ask AI Tutor</span>
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="h-auto py-3 flex-col gap-1.5"
						onClick={handleScheduleReview}
						disabled={isProcessing || takenActions.has('schedule_review')}
					>
						<HugeiconsIcon icon={Timer02Icon} className="w-5 h-5 text-primary" />
						<span className="text-xs font-medium">Schedule Review</span>
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="h-auto py-3 flex-col gap-1.5"
						onClick={handleGenerateFlashcards}
						disabled={isProcessing || takenActions.has('generate_flashcards')}
					>
						<HugeiconsIcon icon={RefreshIcon} className="w-5 h-5 text-primary" />
						<span className="text-xs font-medium">Generate Flashcards</span>
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="h-auto py-3 flex-col gap-1.5"
						onClick={handleUpdatePath}
						disabled={isProcessing || takenActions.has('suggest_retake')}
					>
						<HugeiconsIcon icon={LightbulbOffIcon} className="w-5 h-5 text-primary" />
						<span className="text-xs font-medium">Update Study Path</span>
					</Button>
				</div>

				{takenActions.size > 0 && (
					<p className="text-xs text-center text-muted-foreground">
						{takenActions.size} action{takenActions.size > 1 ? 's' : ''} taken
					</p>
				)}
			</div>

			{onDismiss && (
				<div className="px-4 pb-4">
					<Button variant="ghost" size="sm" className="w-full" onClick={onDismiss}>
						Dismiss
					</Button>
				</div>
			)}
		</m.div>
	);
});
