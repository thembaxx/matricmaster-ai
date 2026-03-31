'use client';

import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { QuizAutoSaveData } from '@/services/quiz-auto-save';

interface QuizRecoveryDialogProps {
	isOpen: boolean;
	savedState: QuizAutoSaveData | null;
	onConfirm: () => void;
	onDismiss: () => void;
}

export function QuizRecoveryDialog({
	isOpen,
	savedState,
	onConfirm,
	onDismiss,
}: QuizRecoveryDialogProps) {
	if (!savedState) return null;

	const minutesAgo = Math.floor((Date.now() - (savedState.savedAt ?? 0)) / 60000);
	const timeAgo =
		minutesAgo < 1 ? 'less than a minute' : `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''}`;
	const progress = ((savedState.currentQuestionIndex + 1) / savedState.questionCount) * 100;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
							<RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<DialogTitle>Resume Your Quiz?</DialogTitle>
							<DialogDescription className="mt-1">We found a quiz in progress</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="rounded-lg bg-muted/50 p-4">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Quiz</span>
							<span className="font-medium">{savedState.quizId}</span>
						</div>
						<div className="mt-2 flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Progress</span>
							<span className="font-medium">
								Question {savedState.currentQuestionIndex + 1} of {savedState.questionCount}
							</span>
						</div>
						<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
							<div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
						</div>
					</div>

					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="h-4 w-4" />
						<span>Last saved {timeAgo} ago</span>
					</div>

					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="rounded-md bg-muted/50 p-3 text-center">
							<div className="text-lg font-bold text-green-600 dark:text-green-400">
								{savedState.correctCount}
							</div>
							<div className="text-muted-foreground">Correct</div>
						</div>
						<div className="rounded-md bg-muted/50 p-3 text-center">
							<div className="text-lg font-bold text-red-600 dark:text-red-400">
								{savedState.incorrectCount}
							</div>
							<div className="text-muted-foreground">Incorrect</div>
						</div>
					</div>
				</div>

				<DialogFooter className="flex-col gap-2 sm:flex-row">
					<Button variant="outline" onClick={onDismiss} className="w-full sm:w-auto">
						Start Fresh
					</Button>
					<Button onClick={onConfirm} className="w-full sm:w-auto">
						Resume Quiz
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
