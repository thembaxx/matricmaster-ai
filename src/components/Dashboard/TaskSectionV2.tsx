'use client';

import { Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TaskSectionProps {
	title: string;
	priority: 'high' | 'medium' | 'low';
	expanded: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}

export function TaskSection({ title, priority, expanded, onToggle, children }: TaskSectionProps) {
	const colors = {
		high: 'bg-tiimo-yellow text-tiimo-gray-dark',
		medium: 'bg-tiimo-lavender text-white',
		low: 'bg-tiimo-green text-white',
	};

	return (
		<m.section layout className="space-y-4">
			<button
				type="button"
				onClick={onToggle}
				className="flex items-center justify-between w-full group tiimo-press"
			>
				<div className="flex items-center gap-3">
					<div
						className={cn(
							'px-4 py-1.5 rounded-full text-[10px] font-medium tracking-wide shadow-sm',
							colors[priority]
						)}
					>
						{title}
					</div>
					<div className="h-[2px] w-12 bg-border rounded-full group-hover:bg-tiimo-lavender/30 transition-colors" />
				</div>
				<m.div
					animate={{ rotate: expanded ? 180 : 0 }}
					className="p-1.5 bg-secondary rounded-full text-tiimo-gray-muted"
				>
					<HugeiconsIcon icon={Menu01Icon} className="w-3.5 h-3.5" />
				</m.div>
			</button>

			<AnimatePresence mode="popLayout">
				{expanded && (
					<m.div
						layout
						initial={{ opacity: 0, height: 0, scale: 0.98 }}
						animate={{ opacity: 1, height: 'auto', scale: 1 }}
						exit={{ opacity: 0, height: 0, scale: 0.98 }}
						transition={{ type: 'spring', stiffness: 300, damping: 25 }}
						className="space-y-4 overflow-hidden"
					>
						{children}
					</m.div>
				)}
			</AnimatePresence>
		</m.section>
	);
}
