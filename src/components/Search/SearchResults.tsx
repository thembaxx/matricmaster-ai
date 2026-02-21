'use client';

import { AnimatePresence, m } from 'framer-motion';
import { ChevronRight, FileText, Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import type { PastPaper } from '@/lib/db/schema';

interface SearchResultsProps {
	results: PastPaper[];
}

export function SearchResults({ results }: SearchResultsProps) {
	const router = useRouter();

	return (
		<m.div variants={STAGGER_CONTAINER} initial="hidden" animate="visible" className="space-y-6">
			<h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
				Database Findings ({results.length})
			</h2>
			<AnimatePresence mode="popLayout">
				{results.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{results.map((paper) => (
							<m.div
								key={paper.id}
								variants={STAGGER_ITEM}
								layout
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								whileHover={{ y: -4, scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Card
									className="p-6 border-2 border-border/50 shadow-sm bg-card rounded-[2rem] flex items-center justify-between group cursor-pointer hover:border-primary/20 hover:shadow-2xl transition-all"
									onClick={() => router.push(`/past-paper?id=${paper.id}`)}
								>
									<div className="flex items-center gap-5">
										<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
											<FileText className="w-6 h-6 text-primary" />
										</div>
										<div>
											<h4 className="font-black text-foreground text-base tracking-tight uppercase">
												{paper.subject} {paper.paper}
											</h4>
											<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
												{paper.month} {paper.year}
											</p>
										</div>
									</div>
									<div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all">
										<ChevronRight className="w-5 h-5" />
									</div>
								</Card>
							</m.div>
						))}
					</div>
				) : (
					<m.div
						key="no-results"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-40"
					>
						<div className="w-32 h-32 bg-muted rounded-[3.5rem] flex items-center justify-center">
							<SearchIcon className="w-16 h-16 text-muted-foreground" />
						</div>
						<div className="space-y-2">
							<h3 className="font-black text-muted-foreground uppercase tracking-widest text-sm">
								Nothing here
							</h3>
							<p className="text-muted-foreground font-bold">Try a different search term</p>
						</div>
					</m.div>
				)}
			</AnimatePresence>
		</m.div>
	);
}
