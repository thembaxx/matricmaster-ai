'use client';

import { Cancel01Icon, Clock01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
		<m.div variants={STAGGER_ITEM} className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-muted-foreground" />
					<h2 className="text-[10px] font-black text-muted-foreground  tracking-[0.3em]">
						ClockCounterClockwise
					</h2>
				</div>
				{searches.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearAll}
						className="h-8 px-4 text-[10px] font-black  tracking-widest text-muted-foreground hover:text-rose-500"
					>
						<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
						Clear All
					</Button>
				)}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<AnimatePresence mode="popLayout">
					{isLoading ? (
						[1, 2, 3, 4].map((item) => (
							<m.div
								key={`search-history-skeleton-${item}`}
								className="h-[68px] rounded-[1.5rem] overflow-hidden border-2 border-border/50"
							>
								<Skeleton className="w-full h-full" />
							</m.div>
						))
					) : searches.length > 0 ? (
						searches.map((search) => (
							<m.div
								key={search.id}
								variants={STAGGER_ITEM}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								whileHover={{ x: 4 }}
								className="flex items-center justify-between bg-card rounded-[1.5rem] border-2 border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden"
							>
								<button
									type="button"
									onClick={() => onSearchClick(search.query)}
									className="flex-1 flex items-center p-5 text-left focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset outline-none"
									aria-label={`MagnifyingGlass for ${search.query}`}
								>
									<span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
										{search.query}
									</span>
								</button>
								<button
									title="Backspace search item"
									aria-label={`Backspace search for ${search.query}`}
									type="button"
									onClick={(e) => onDelete(search.id, e)}
									className="md:opacity-0 opacity-100 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-rose-500 p-5 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
								>
									<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
								</button>
							</m.div>
						))
					) : (
						<div className="col-span-full py-12 text-center opacity-40">
							<p className="text-sm font-bold  tracking-widest">No history yet</p>
						</div>
					)}
				</AnimatePresence>
			</div>
		</m.div>
	);
});
