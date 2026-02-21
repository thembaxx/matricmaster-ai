'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

type QuizHintCardProps = {
	hint: string;
	title?: string;
	showWhen?: boolean;
	variant?: 'hint' | 'smart';
};

export function QuizHintCard({
	hint,
	title = "Teacher's Hint",
	showWhen = true,
	variant = 'hint',
}: QuizHintCardProps) {
	if (!showWhen) return null;

	if (variant === 'smart') {
		return (
			<AnimatePresence mode="wait">
				<m.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-5 items-start transition-all hover:bg-primary/10"
				>
					<div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
						<Sparkles className="w-6 h-6 text-primary" />
					</div>
					<div className="space-y-1">
						<h4 className="font-black text-primary text-xs uppercase tracking-widest">
							Smart Hint
						</h4>
						<p className="text-sm text-muted-foreground font-medium leading-relaxed">{hint}</p>
					</div>
				</m.div>
			</AnimatePresence>
		);
	}

	return (
		<div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[2rem] flex items-start gap-4">
			<div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
				<Lightbulb className="w-5 h-5 text-amber-600" />
			</div>
			<div>
				<h4 className="font-black text-amber-900 dark:text-amber-100 text-xs uppercase tracking-widest mb-1">
					{title}
				</h4>
				<p className="text-sm text-amber-800/80 dark:text-amber-200/80 font-medium">{hint}</p>
			</div>
		</div>
	);
}
