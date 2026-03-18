'use client';

import { Cancel01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HIGHLIGHT_COLORS } from '@/hooks/usePdfViewer';

interface PdfSelectionBubbleProps {
	selectedText: string;
	setSelectedText: (text: string) => void;
	addHighlight: (text: string, color: string) => void;
	onExtract: (text: string) => void;
}

export function PdfSelectionBubble({
	selectedText,
	setSelectedText,
	addHighlight,
	onExtract,
}: PdfSelectionBubbleProps) {
	return (
		<AnimatePresence>
			{selectedText && (
				<m.div
					initial={{ opacity: 0, y: 20, x: '-50%' }}
					animate={{ opacity: 1, y: 0, x: '-50%' }}
					exit={{ opacity: 0, y: 20, x: '-50%' }}
					className="absolute bottom-12 left-1/2 z-50 px-4 w-full max-w-fit"
				>
					<div className="premium-glass p-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-brand-blue/20">
						<div className="px-3 py-1.5 bg-brand-blue/10 rounded-xl max-w-[180px] truncate border border-brand-blue/5">
							<span className="text-[11px] font-bold text-brand-blue italic">"{selectedText}"</span>
						</div>
						<div className="flex gap-1.5">
							<Button
								size="sm"
								variant="outline"
								className="h-8 rounded-xl border-primary/20 text-primary hover:bg-primary/10"
								onClick={() => {
									onExtract(selectedText);
								}}
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-1.5" />
								Extract Cards
							</Button>
							{HIGHLIGHT_COLORS.map((color) => (
								<button
									type="button"
									key={color.value}
									onClick={() => {
										addHighlight(selectedText, color.value);
									}}
									className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm transition-all hover:scale-125 active:scale-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
									style={{ backgroundColor: color.value }}
									aria-label={`Highlight with ${color.name}`}
								/>
							))}
						</div>
						<div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
							onClick={() => setSelectedText('')}
							aria-label="Cancel selection"
						>
							<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
						</Button>
					</div>
				</m.div>
			)}
		</AnimatePresence>
	);
}
