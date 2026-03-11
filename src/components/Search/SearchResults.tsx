'use client';

import { ArrowRight01Icon as CaretRight, File01Icon as FileText, Search01Icon as SearchIcon } from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import type { PastPaper } from '@/lib/db/schema';

interface SearchResultsProps {
	results: PastPaper[];
}

export const SearchResults = memo(function SearchResults({ results }: SearchResultsProps) {
	const router = useRouter();

	return (
		<m.div variants={STAGGER_CONTAINER} initial="hidden" animate="visible" className="space-y-8">
			<div className="flex items-center gap-4 px-2">
				<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
					Library findings ({results.length})
				</h2>
				<div className="h-px flex-1 bg-muted/10" />
			</div>
			<AnimatePresence mode="popLayout">
				{results.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{results.map((paper) => (
							<m.div
								key={paper.id}
								variants={STAGGER_ITEM}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								whileHover={{ y: -8 }}
							>
								<button
									type="button"
									className="p-8 w-full text-left border-none shadow-[0_15px_45px_rgba(0,0,0,0.05)] bg-card rounded-[3rem] flex items-center justify-between group cursor-pointer hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-700"
									onClick={() => router.push(`/past-paper?id=${paper.id}`)}
								>
									<div className="flex items-center gap-6">
										<div className="w-16 h-16 rounded-[1.25rem] bg-tiimo-blue text-white flex items-center justify-center shadow-xl shadow-tiimo-blue/20 group-hover:rotate-6 transition-transform duration-500">
											<FileText size={32} className="stroke-[3px]" />
										</div>
										<div className="space-y-1">
											<h4 className="font-black text-foreground text-xl tracking-tight leading-none uppercase">
												{paper.subject} <span className="text-muted-foreground/40">{paper.paper}</span>
											</h4>
											<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
												{paper.month} {paper.year}
											</p>
										</div>
									</div>
									<div className="w-12 h-12 rounded-xl bg-muted/10 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-500">
										<CaretRight size={24} className="stroke-[3px]" />
									</div>
								</button>
							</m.div>
						))}
					</div>
				) : (
					<m.div
						key="no-results"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="py-40 flex flex-col items-center justify-center text-center space-y-8"
					>
						<div className="w-32 h-32 bg-muted/10 rounded-[3rem] flex items-center justify-center mx-auto">
							<SearchIcon size={48} className="text-muted-foreground/20 stroke-[3px]" />
						</div>
						<div className="space-y-2">
							<h3 className="text-2xl font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
								Vault empty
							</h3>
							<p className="text-muted-foreground/20 font-bold">Try adjusting your search criteria</p>
						</div>
					</m.div>
				)}
			</AnimatePresence>
		</m.div>
	);
});
