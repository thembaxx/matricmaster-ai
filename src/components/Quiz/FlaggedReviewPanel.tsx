'use client';

import { Flag02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FlaggedReviewPanelProps {
	flaggedQuestions: Array<{ id: string; index: number; question: string }>;
	onNavigateToQuestion: (index: number) => void;
	onClearAll: () => void;
	isOpen: boolean;
	onClose: () => void;
}

export function FlaggedReviewPanel({
	flaggedQuestions,
	onNavigateToQuestion,
	onClearAll,
	isOpen,
	onClose,
}: FlaggedReviewPanelProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-end">
			<button
				type="button"
				className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-default"
				onClick={onClose}
				aria-label="Close review panel"
			/>

			<div className="relative w-80 max-h-[70vh] bg-card border-l border-border shadow-2xl overflow-hidden">
				<div className="p-4 border-b border-border">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<HugeiconsIcon icon={Flag02Icon} className="w-5 h-5 text-brand-orange" />
							<span className="font-semibold text-foreground">Review Flagged</span>
							<Badge variant="secondary" className="text-xs">
								{flaggedQuestions.length}
							</Badge>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="h-8 w-8 p-0"
							aria-label="Close"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<title>Close</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</Button>
					</div>
				</div>

				<div className="overflow-y-auto max-h-[calc(70vh-80px)]">
					{flaggedQuestions.length === 0 ? (
						<div className="p-6 text-center text-muted-foreground text-sm">
							No questions flagged yet. Tap the flag icon on any question to mark it for review.
						</div>
					) : (
						<div className="p-2 space-y-1">
							{flaggedQuestions.map((q, idx) => (
								<button
									type="button"
									key={q.id}
									onClick={() => onNavigateToQuestion(q.index)}
									className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group"
								>
									<div className="flex items-start gap-2">
										<span className="text-xs font-medium text-muted-foreground shrink-0 mt-0.5">
											{idx + 1}.
										</span>
										<span className="text-sm text-foreground line-clamp-2 group-hover:text-brand-orange transition-colors">
											{q.question.length > 80 ? `${q.question.substring(0, 80)}...` : q.question}
										</span>
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				{flaggedQuestions.length > 0 && (
					<div className="p-4 border-t border-border">
						<Button
							variant="outline"
							size="sm"
							onClick={onClearAll}
							className="w-full text-muted-foreground hover:text-destructive"
						>
							Clear all flags
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
