'use client';

import { Idea01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type QuizHintCardProps = {
	hint?: string;
	title?: string;
	showWhen?: boolean;
	variant?: 'hint' | 'smart';
	isLoading?: boolean;
	subject?: string;
	error?: string;
	onRetry?: () => void;
	onUseAITutor?: () => void;
};

export function QuizHintCard({
	hint,
	title = "Teacher's Hint",
	showWhen = true,
	variant = 'hint',
	isLoading = false,
	subject,
	error,
	onRetry,
	onUseAITutor,
}: QuizHintCardProps) {
	if (!showWhen) return null;

	if (isLoading) {
		return (
			<div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-5 items-start">
				<div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shrink-0">
					<div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
				</div>
				<div className="space-y-2 flex-1">
					<Skeleton className="h-3 w-1/3" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[2rem] flex items-start gap-4">
				<div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
					<HugeiconsIcon icon={Idea01Icon} className="w-5 h-5 text-amber-600" />
				</div>
				<div className="flex-1">
					<h4 className="font-black text-amber-900 dark:text-amber-100 text-xs  tracking-widest mb-2">
						Hint Unavailable
					</h4>
					<p className="text-sm text-amber-800/80 dark:text-amber-200/80 mb-3">{error}</p>
					<div className="flex gap-2">
						{onRetry && (
							<Button size="sm" variant="outline" onClick={onRetry}>
								Try Again
							</Button>
						)}
						{onUseAITutor && (
							<Button size="sm" onClick={onUseAITutor}>
								Try AI Tutor
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	}

	if (!hint) return null;

	if (variant === 'smart') {
		return (
			<AnimatePresence mode="wait" initial={false}>
				<m.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-5 items-start transition-all hover:bg-primary/10"
				>
					<div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
						<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6 text-primary" />
					</div>
					<div className="space-y-1 flex-1">
						<h4 className="font-black text-primary text-xs  tracking-widest">Smart Hint</h4>
						<MarkdownRenderer content={hint} subject={subject} className="text-sm text-muted-foreground" />
					</div>
				</m.div>
			</AnimatePresence>
		);
	}

	return (
		<div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[2rem] flex items-start gap-4">
			<div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
				<HugeiconsIcon icon={Idea01Icon} className="w-5 h-5 text-amber-600" />
			</div>
			<div className="flex-1">
				<h4 className="font-black text-amber-900 dark:text-amber-100 text-xs  tracking-widest mb-1">
					{title}
				</h4>
				<MarkdownRenderer
					content={hint}
					subject={subject}
					className="text-sm text-amber-800/80 dark:text-amber-200/80"
				/>
			</div>
		</div>
	);
}
