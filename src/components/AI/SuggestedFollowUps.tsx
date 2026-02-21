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
		<div className="mt-4 pt-4 border-t border-border/30">
			<div className="flex items-center gap-2 mb-3">
				<div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
					<Sparkles className="h-3 w-3 text-primary" />
				</div>
				<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
					Suggested follow-ups
				</span>
			</div>
			<div className="flex flex-wrap gap-2">
				{suggestions.slice(0, 3).map((suggestion, index) => (
					<Button
						key={`${suggestion}-${index}`}
						variant="outline"
						size="sm"
						className="h-auto py-2 px-4 text-xs bg-surface-elevated/20 hover:bg-surface-elevated border-border/50 rounded-2xl text-primary font-medium transition-all duration-200 ios-active-scale group"
						onClick={() => onSelectSuggestion(suggestion)}
					>
						{suggestion}
						<ArrowRight className="h-3 w-3 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
					</Button>
				))}
			</div>
		</div>
	);
}

export default SuggestedFollowUps;
