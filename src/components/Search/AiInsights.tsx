'use client';

import { Loading03Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AiInsightsProps {
	isLoading: boolean;
	suggestions: string[] | undefined;
	tip: string | undefined;
	onSuggestionClick: (suggestion: string) => void;
}

export const AiInsights = memo(function AiInsights({
	isLoading,
	suggestions,
	tip,
	onSuggestionClick,
}: AiInsightsProps) {
	return (
		<AnimatePresence mode="wait">
			{(isLoading || suggestions) && (
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="space-y-6"
				>
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
						<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
							AI Insights
						</h2>
					</div>
					<Card className="p-8 bg-zinc-900 text-white rounded-[3rem] relative overflow-hidden border-none shadow-2xl">
						<div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<HugeiconsIcon
									icon={Loading03Icon}
									className="w-10 h-10 text-primary animate-spin"
								/>
							</div>
						) : (
							<div className="space-y-8 relative z-10">
								{tip && (
									<p className="text-lg md:text-xl font-bold leading-relaxed text-white/90 italic">
										"{tip}"
									</p>
								)}
								<div className="flex flex-wrap gap-3">
									{suggestions?.map((suggestion) => (
										<m.div key={suggestion} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
											<Badge
												variant="secondary"
												className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-zinc-900 transition-all cursor-pointer"
												onClick={() => onSuggestionClick(suggestion)}
											>
												{suggestion}
											</Badge>
										</m.div>
									))}
								</div>
							</div>
						)}
					</Card>
				</m.div>
			)}
		</AnimatePresence>
	);
});
