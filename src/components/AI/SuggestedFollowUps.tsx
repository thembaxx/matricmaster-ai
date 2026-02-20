'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestedFollowUpsProps {
	suggestions: string[];
	onSelectSuggestion: (suggestion: string) => void;
}

export function SuggestedFollowUps({ suggestions, onSelectSuggestion }: SuggestedFollowUpsProps) {
	if (!suggestions || suggestions.length === 0) {
		return null;
	}

	return (
		<div className="mt-3 pt-3 border-t border-border/50">
			<div className="flex items-center gap-2 mb-2">
				<Sparkles className="h-3.5 w-3.5 text-primary" />
				<span className="text-xs font-medium text-muted-foreground">Suggested follow-ups</span>
			</div>
			<div className="flex flex-wrap gap-2">
				{suggestions.slice(0, 3).map((suggestion, index) => (
					<Button
						key={`${suggestion}-${index}`}
						variant="ghost"
						size="sm"
						className="h-auto py-1.5 px-3 text-xs bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary"
						onClick={() => onSelectSuggestion(suggestion)}
					>
						{suggestion}
						<ArrowRight className="h-3 w-3 ml-1.5" />
					</Button>
				))}
			</div>
		</div>
	);
}

export default SuggestedFollowUps;
