'use client';

import {
	ArrowRight01Icon,
	Calendar02Icon,
	LightbulbOffIcon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

interface AdaptiveActionsProps {
	topic: string;
	subject?: string;
	subjectId?: number;
	score?: number;
	onActionComplete?: (action: string) => void;
	compact?: boolean;
	disabled?: boolean;
}

type ActionKey = 'ai_tutor' | 'schedule_review' | 'generate_flashcards' | 'update_path';

const ACTION_ICONS: Record<ActionKey, typeof SparklesIcon> = {
	ai_tutor: SparklesIcon,
	schedule_review: Calendar02Icon,
	generate_flashcards: LightbulbOffIcon,
	update_path: ArrowRight01Icon,
};

const ACTION_LABELS: Record<ActionKey, string> = {
	ai_tutor: 'Ask AI Tutor',
	schedule_review: 'Schedule Review',
	generate_flashcards: 'Generate Flashcards',
	update_path: 'Update Study Path',
};

export const AdaptiveActions = memo(function AdaptiveActions({
	topic,
	subject = '',
	subjectId = 1,
	score,
	onActionComplete,
	compact = false,
	disabled = false,
}: AdaptiveActionsProps) {
	const router = useRouter();
	const [loadingAction, setLoadingAction] = useState<ActionKey | null>(null);
	const [completedActions, setCompletedActions] = useState<Set<ActionKey>>(new Set());

	const executeAction = useCallback(
		async (action: ActionKey) => {
			if (loadingAction || completedActions.has(action)) return;

			setLoadingAction(action);

			try {
				const endpoint = '/api/adaptive-learning/process';
				const body: Record<string, unknown> = {
					action,
					topic,
					subject,
					subjectId,
				};

				if (action === 'update_path') {
					body.pathId = 'default';
					body.moduleId = 'default';
				}

				const response = await fetch(endpoint, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});

				if (response.ok) {
					setCompletedActions((prev) => new Set([...prev, action]));
					onActionComplete?.(action);
				}
			} catch (error) {
				console.debug('[AdaptiveActions] Action failed:', error);
			} finally {
				setLoadingAction(null);
			}
		},
		[loadingAction, completedActions, topic, subject, subjectId, onActionComplete]
	);

	const handleAiTutor = useCallback(() => {
		router.push(`/tutoring/session?topic=${encodeURIComponent(topic)}&context=weak_topic`);
	}, [router, topic]);

	const handleScheduleReview = useCallback(() => {
		executeAction('schedule_review');
	}, [executeAction]);

	const handleGenerateFlashcards = useCallback(() => {
		executeAction('generate_flashcards');
	}, [executeAction]);

	const handleUpdatePath = useCallback(() => {
		executeAction('update_path');
		router.push(`/study-path?topic=${encodeURIComponent(topic)}&suggested=true`);
	}, [executeAction, router, topic]);

	const actions: { key: ActionKey; handler: () => void; icon: typeof SparklesIcon }[] = [
		{ key: 'ai_tutor', handler: handleAiTutor, icon: ACTION_ICONS.ai_tutor },
		{ key: 'schedule_review', handler: handleScheduleReview, icon: ACTION_ICONS.schedule_review },
		{
			key: 'generate_flashcards',
			handler: handleGenerateFlashcards,
			icon: ACTION_ICONS.generate_flashcards,
		},
		{ key: 'update_path', handler: handleUpdatePath, icon: ACTION_ICONS.update_path },
	];

	const isLoading = (action: ActionKey) => loadingAction === action;
	const isCompleted = (action: ActionKey) => completedActions.has(action);

	if (compact) {
		return (
			<div className="flex items-center gap-2">
				{actions.map(({ key, handler }) => (
					<Button
						key={key}
						variant="ghost"
						size="icon"
						className="w-8 h-8"
						onClick={handler}
						disabled={disabled || isLoading(key) || isCompleted(key)}
					>
						{isLoading(key) ? (
							<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
						) : isCompleted(key) ? (
							<HugeiconsIcon icon={ACTION_ICONS[key]} className="w-4 h-4 text-success" />
						) : (
							<HugeiconsIcon icon={ACTION_ICONS[key]} className="w-4 h-4" />
						)}
					</Button>
				))}
			</div>
		);
	}

	return (
		<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">Quick Actions</span>
				{score !== undefined && (
					<span className="text-xs font-mono text-muted-foreground">
						Score: {Math.round(score * 100)}%
					</span>
				)}
			</div>

			<div className="grid grid-cols-2 gap-2">
				{actions.map(({ key, handler, icon: Icon }) => (
					<m.div
						key={key}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: actions.findIndex((a) => a.key === key) * 0.05 }}
					>
						<Button
							variant="outline"
							className="w-full h-auto py-3 px-4 flex items-center gap-3"
							onClick={handler}
							disabled={disabled || isLoading(key)}
						>
							{isLoading(key) ? (
								<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							) : isCompleted(key) ? (
								<div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
									<svg
										className="w-3 h-3 text-success"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-label="Completed"
									>
										<title>Completed</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={3}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
							) : (
								<HugeiconsIcon icon={Icon} className="w-5 h-5 text-primary" />
							)}
							<span className="text-sm font-medium">{ACTION_LABELS[key]}</span>
						</Button>
					</m.div>
				))}
			</div>

			{completedActions.size > 0 && (
				<p className="text-xs text-center text-muted-foreground">
					{completedActions.size} of {actions.length} actions completed
				</p>
			)}
		</m.div>
	);
});
