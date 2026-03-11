'use client';

import { Loading03Icon as CircleNotch, SparklesIcon as Sparkle } from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SmartInsightsProps {
	isLoading: boolean;
	suggestions: string[] | undefined;
	tip: string | undefined;
	onSuggestionClick: (suggestion: string) => void;
}

export const SmartInsights = memo(function SmartInsights({
	isLoading,
	suggestions,
	tip,
	onSuggestionClick,
}: SmartInsightsProps) {
	return (
		<AnimatePresence mode="wait">
			{(isLoading || suggestions) && (
				<m.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 30 }}
					className="space-y-8"
				>
					<div className="flex items-center gap-4 px-2">
						<Sparkle size={20} className="text-tiimo-purple stroke-[3px]" />
						<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
							Smart insights
						</h2>
					</div>
					<Card className="p-10 bg-zinc-950 text-white rounded-[3.5rem] relative overflow-hidden border-none shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
						<div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
						{isLoading ? (
							<div className="flex items-center justify-center py-20">
								<CircleNotch size={48} className="animate-spin text-white opacity-40" />
							</div>
						) : (
							<div className="space-y-10 relative z-10">
								{tip && (
									<p className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-white italic">
										"{tip}"
									</p>
								)}
								<div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
									{suggestions?.map((suggestion) => (
										<m.button
											key={suggestion}
											whileHover={{ scale: 1.05, y: -4 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => onSuggestionClick(suggestion)}
											className="px-6 py-3 rounded-2xl bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-zinc-950 transition-all active:scale-95"
										>
											{suggestion}
										</m.button>
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
