'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AIExplanationCardProps {
	explanation: string | null;
	isLoading: boolean;
	onExplain: () => void;
	subject?: string;
	className?: string;
}

export function AIExplanationCard({
	explanation,
	isLoading,
	onExplain,
	subject,
	className,
}: AIExplanationCardProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<Card
			className={cn(
				'overflow-hidden border-none shadow-lg relative',
				'bg-linear-to-br from-primary/5 via-background to-primary/5',
				className
			)}
		>
			{/* Gradient Border Effect */}
			<div className="absolute inset-0 p-[1px] bg-linear-to-r from-primary/30 via-primary/10 to-primary/30 rounded-[inherit] -z-10" />

			<div className="p-5 space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
							<Sparkles className="h-5 w-5 text-primary animate-pulse-soft" />
						</div>
						<div>
							<h4 className="text-sm font-black font-lexend tracking-tight">MatricMaster AI</h4>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
								Personal Tutor {subject ? `• ${subject}` : ''}
							</p>
						</div>
					</div>

					{explanation ? (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsExpanded(!isExpanded)}
							className="rounded-full hover:bg-primary/5"
						>
							{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						</Button>
					) : (
						<Button
							size="sm"
							variant="ios"
							onClick={onExplain}
							disabled={isLoading}
							className="rounded-xl h-9 px-4 font-black text-xs uppercase tracking-wider"
						>
							{isLoading ? (
								<Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
							) : (
								<Sparkles className="h-3.5 w-3.5 mr-2" />
							)}
							Explain
						</Button>
					)}
				</div>

				<AnimatePresence>
					{explanation && isExpanded && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
						>
							<div className="pt-4 border-t border-primary/10">
								<MarkdownRenderer content={explanation} className="prose-sm" />
								<div className="mt-4 flex items-center justify-between">
									<p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
										AI-generated explanation
									</p>
									<Button
										variant="link"
										size="sm"
										className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary"
										onClick={onExplain}
										disabled={isLoading}
									>
										Regenerate
									</Button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{isLoading && !explanation && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="py-8 flex flex-col items-center justify-center space-y-3"
					>
						<div className="flex gap-1.5">
							<span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
							<span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
							<span className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" />
						</div>
						<p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
							Analyzing question
						</p>
					</motion.div>
				)}
			</div>
		</Card>
	);
}

export default AIExplanationCard;
