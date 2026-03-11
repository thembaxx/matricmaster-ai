'use client';

import { Loading03Icon as CircleNotch, TimeClockIcon as Clock, Delete02Icon as Trash, Cancel01Icon as X } from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { STAGGER_ITEM } from '@/lib/animation-presets';
import type { SearchHistory } from '@/lib/db/schema';

interface SearchHistoryListProps {
	searches: SearchHistory[];
	isLoading: boolean;
	onDelete: (id: string, e: React.MouseEvent) => void;
	onClearAll: () => void;
	onSearchClick: (query: string) => void;
}

export const SearchHistoryList = memo(function SearchHistoryList({
	searches,
	isLoading,
	onDelete,
	onClearAll,
	onSearchClick,
}: SearchHistoryListProps) {
	return (
		<m.div variants={STAGGER_ITEM} className="space-y-8">
			<div className="flex items-center justify-between px-2">
				<div className="flex items-center gap-4">
					<Clock size={20} className="text-tiimo-blue stroke-[3px]" />
					<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
						Previous
					</h2>
				</div>
				{searches.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearAll}
						className="h-10 px-4 rounded-xl bg-muted/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:bg-tiimo-pink hover:text-white transition-all"
					>
						<Trash size={16} className="mr-2 stroke-[3px]" />
						Reset
					</Button>
				)}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<AnimatePresence mode="popLayout">
					{isLoading ? (
						<div className="col-span-full flex items-center justify-center py-16">
							<CircleNotch size={32} className="text-primary animate-spin opacity-40" />
						</div>
					) : searches.length > 0 ? (
						searches.map((search) => (
							<m.div
								key={search.id}
								variants={STAGGER_ITEM}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								whileHover={{ scale: 1.02 }}
								className="flex items-center justify-between bg-card rounded-[2rem] border-none shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all group overflow-hidden"
							>
								<button
									type="button"
									onClick={() => onSearchClick(search.query)}
									className="flex-1 flex items-center p-6 text-left outline-none"
									aria-label={`Search for ${search.query}`}
								>
									<span className="text-md font-black text-foreground group-hover:text-primary transition-colors">
										{search.query}
									</span>
								</button>
								<button
									title="Remove item"
									aria-label={`Remove ${search.query}`}
									type="button"
									onClick={(e) => onDelete(search.id, e)}
									className="text-muted-foreground/20 hover:text-tiimo-pink p-6 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
								>
									<X size={20} className="stroke-[3px]" />
								</button>
							</m.div>
						))
					) : (
						<div className="col-span-full py-16 text-center opacity-40">
							<p className="text-[10px] font-black uppercase tracking-[0.3em]">No history yet</p>
						</div>
					)}
				</AnimatePresence>
			</div>
		</m.div>
	);
});
