'use client';

import { Cancel01Icon, Note01Icon, PencilEdit01Icon, TextIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Highlight } from '@/hooks/usePdfViewer';
import { cn } from '@/lib/utils';

interface PdfSidebarProps {
	showNotes: boolean;
	setShowNotes: (show: boolean) => void;
	highlights: Highlight[];
	deleteHighlight: (id: string) => void;
	addNote: (highlightId: string, note: string) => void;
}

export function PdfSidebar({
	showNotes,
	setShowNotes,
	highlights,
	deleteHighlight,
	addNote,
}: PdfSidebarProps) {
	return (
		<aside
			className={cn(
				'fixed md:relative inset-y-0 right-0 z-50 w-full md:w-[360px] border-l border-border/50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] premium-glass shadow-2xl md:shadow-none',
				showNotes ? 'translate-x-0' : 'translate-x-full'
			)}
			aria-label="Annotations Sidebar"
		>
			<div className="flex flex-col h-full">
				<header className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-transparent z-10">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
							<HugeiconsIcon icon={Note01Icon} className="w-5 h-5 text-brand-blue" />
						</div>
						<div>
							<h3 className="font-bold tracking-tight text-lg">My Notes</h3>
							<p className="text-[10px] font-black  tracking-widest text-muted-foreground">
								{highlights.length} Annotations
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-10 w-10 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
						onClick={() => setShowNotes(false)}
						aria-label="Hide sidebar"
					>
						<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
					</Button>
				</header>

				<ScrollArea className="flex-1 overflow-auto">
					<div className="p-6 space-y-6">
						{highlights.length > 0 ? (
							highlights.map((highlight) => (
								<div
									key={highlight.id}
									className="group relative p-5 rounded-[2rem] border border-border transition-all hover:shadow-xl hover:border-brand-blue/30 bg-card/50"
									style={{ borderLeftWidth: '8px', borderLeftColor: highlight.color }}
								>
									<div className="flex items-start justify-between gap-4 mb-4">
										<span className="px-3 py-1 rounded-full bg-muted text-[10px] font-black  tracking-[0.15em] text-muted-foreground border border-border">
											Page {highlight.pageNumber}
										</span>
										<button
											type="button"
											className="h-9 w-9 md:h-8 md:w-8 rounded-full md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 touch-manipulation flex items-center justify-center"
											onClick={() => deleteHighlight(highlight.id)}
											aria-label="Delete highlight"
										>
											<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
										</button>
									</div>

									<p className="text-sm font-medium leading-relaxed mb-4 text-foreground dark:text-muted-foreground italic pl-2 border-l-2 border-border">
										"{highlight.text}"
									</p>

									<div className="space-y-4">
										{highlight.note ? (
											<div className="p-4 rounded-2xl bg-muted dark:bg-background border border-border text-sm shadow-inner relative overflow-hidden">
												<div className="absolute top-0 right-0 p-1">
													<HugeiconsIcon
														icon={PencilEdit01Icon}
														className="w-3 h-3 text-muted-foreground opacity-50"
													/>
												</div>
												<p className="text-muted-foreground leading-relaxed">{highlight.note}</p>
											</div>
										) : null}

										<Button
											variant="outline"
											size="sm"
											className="w-full rounded-2xl text-[11px] font-black  tracking-widest gap-2 py-5 border-border hover:border-brand-blue hover:text-brand-blue transition-all group/btn"
											onClick={() => {
												const note = prompt('Add a note to this highlight:');
												if (note) addNote(highlight.id, note);
											}}
										>
											<HugeiconsIcon
												icon={TextIcon}
												className="w-3 h-3 transition-transform group-hover/btn:scale-125"
											/>
											{highlight.note ? 'Edit Note' : 'Add Note'}
										</Button>
									</div>
								</div>
							))
						) : (
							<div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
								<div className="p-6 rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-800 mb-6 drop-shadow-sm">
									<HugeiconsIcon icon={Note01Icon} className="w-12 h-12" />
								</div>
								<h4 className="font-bold text-lg mb-2">No active notes</h4>
								<p className="text-sm max-w-[200px]">
									Highlights and annotations will appear here for quick access.
								</p>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>
		</aside>
	);
}
