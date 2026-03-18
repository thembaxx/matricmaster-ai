'use client';

import { CheckmarkCircle02Icon, Cancel01Icon as CloseIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card } from '@/components/ui/card';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

export function AISuggestionsPanel() {
	const { suggestions, acceptSuggestion, dismissSuggestion } = useSmartSchedulerStore();

	if (suggestions.length === 0) {
		return (
			<Card className="p-4">
				<h3 className="font-semibold mb-2">AI Suggestions</h3>
				<p className="text-sm text-muted-foreground">
					AI suggestions will appear here to help optimize your schedule.
				</p>
			</Card>
		);
	}

	return (
		<Card className="p-4">
			<h3 className="font-semibold mb-4">AI Suggestions</h3>
			<div className="space-y-3">
				{suggestions.map((suggestion) => (
					<div key={suggestion.id} className="p-3 rounded-lg bg-muted/50 border">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="font-medium text-sm">
									{suggestion.type === 'add' && 'Add Session'}
									{suggestion.type === 'reschedule' && 'Reschedule'}
									{suggestion.type === 'remove' && 'Remove'}
								</div>
								<p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
								{suggestion.block.subject && (
									<div className="text-sm mt-2">
										{suggestion.block.subject}: {suggestion.block.topic}
									</div>
								)}
							</div>
							<div className="flex gap-1 ml-2">
								<button
									type="button"
									onClick={() => acceptSuggestion(suggestion.id)}
									className="p-1.5 rounded-full bg-green-500/20 text-green-600 hover:bg-green-500/30"
								>
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() => dismissSuggestion(suggestion.id)}
									className="p-1.5 rounded-full bg-red-500/20 text-red-600 hover:bg-red-500/30"
								>
									<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
