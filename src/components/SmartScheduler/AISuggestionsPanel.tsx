'use client';

import {
	CheckmarkCircle02Icon,
	Cancel01Icon as CloseIcon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

const TYPE_CONFIG = {
	add: { label: 'Add Session', icon: '📚', color: 'text-blue-600' },
	reschedule: { label: 'Reschedule', icon: '📅', color: 'text-amber-600' },
	remove: { label: 'Remove', icon: '🗑️', color: 'text-red-600' },
};

export function AISuggestionsPanel() {
	const { suggestions, acceptSuggestion, dismissSuggestion } = useSmartSchedulerStore();

	if (suggestions.length === 0) {
		return (
			<Card className="p-5 shadow-sm">
				<div className="flex items-center gap-2 mb-3">
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
					<h3 className="font-semibold text-sm tracking-tight">AI Suggestions</h3>
				</div>
				<div className="flex flex-col items-center justify-center py-6 text-center">
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
						<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6 text-primary" />
					</div>
					<p className="text-sm text-muted-foreground">No suggestions right now.</p>
					<p className="text-xs text-muted-foreground/70 mt-1">
						Study tips will appear here to help optimize your schedule.
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-5 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
				<h3 className="font-semibold text-sm tracking-tight">
					AI Suggestions
					<span className="ml-2 text-xs font-normal text-muted-foreground">
						({suggestions.length})
					</span>
				</h3>
			</div>
			<div className="space-y-3">
				{suggestions.map((suggestion) => {
					const config = TYPE_CONFIG[suggestion.type];
					return (
						<div
							key={suggestion.id}
							className="p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-1.5">
										<span className="text-base">{config.icon}</span>
										<span className={cn('font-medium text-sm', config.color)}>{config.label}</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
										{suggestion.reason}
									</p>
									{suggestion.block.subject && (
										<div className="text-sm mt-2 font-medium">
											{suggestion.block.subject}
											{suggestion.block.topic && (
												<span className="text-muted-foreground font-normal">
													{' '}
													• {suggestion.block.topic}
												</span>
											)}
										</div>
									)}
								</div>
								<div className="flex flex-col gap-1">
									<button
										type="button"
										onClick={() => acceptSuggestion(suggestion.id)}
										className="p-1.5 rounded-full bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-colors"
										title="Accept suggestion"
									>
										<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
									</button>
									<button
										type="button"
										onClick={() => dismissSuggestion(suggestion.id)}
										className="p-1.5 rounded-full bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors"
										title="Dismiss suggestion"
									>
										<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
									</button>
								</div>
							</div>
							<div className="mt-2 flex items-center gap-2">
								<div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
									<div
										className="h-full bg-primary/50 rounded-full"
										style={{ width: `${suggestion.confidence * 100}%` }}
									/>
								</div>
								<span className="text-[10px] text-muted-foreground font-medium">
									{Math.round(suggestion.confidence * 100)}% confidence
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
}
