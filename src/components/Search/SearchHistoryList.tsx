'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Clock, Loader2, Trash2, X } from 'lucide-react';
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

export function SearchHistoryList({
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
					<Clock className="w-4 h-4 text-muted-foreground" />
					<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
						History
					</h2>
				</div>
				{searches.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearAll}
						className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500"
					>
						<Trash2 className="w-4 h-4 mr-2" />
						Clear All
					</Button>
				)}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<AnimatePresence mode="popLayout">
					{isLoading ? (
						<div className="col-span-full flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 text-primary animate-spin" />
						</div>
					) : searches.length > 0 ? (
						searches.map((search) => (
							<m.button
								key={search.id}
								variants={STAGGER_ITEM}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								whileHover={{ x: 4 }}
								type="button"
								onClick={() => onSearchClick(search.query)}
								className="flex items-center justify-between p-5 bg-card rounded-[1.5rem] border-2 border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group"
							>
								<span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
									{search.query}
								</span>
								<button
									title="Delete search item"
									type="button"
									onClick={(e) => onDelete(search.id, e)}
									className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-500 p-2"
								>
									<X className="w-5 h-5" />
								</button>
							</m.button>
						))
					) : (
						<div className="col-span-full py-12 text-center opacity-40">
							<p className="text-sm font-bold uppercase tracking-widest">No history yet</p>
						</div>
					)}
				</AnimatePresence>
			</div>
		</m.div>
	);
}
