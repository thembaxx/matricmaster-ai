'use client';

import {
	ArrowDown01Icon,
	ArrowUp01Icon,
	Loading03Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';
import { appConfig } from '@/app.config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DURATION, EASING } from '@/lib/animation-presets';
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
							<HugeiconsIcon
								icon={SparklesIcon}
								className="h-5 w-5 text-primary animate-pulse-soft"
							/>
						</div>
						<div>
							<h4 className="text-sm font-black font-lexend tracking-tight">{appConfig.name} AI</h4>
							<p className="text-[10px] font-bold text-muted-foreground  tracking-widest">
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
							aria-label={isExpanded ? 'Collapse explanation' : 'Expand explanation'}
							aria-expanded={isExpanded}
						>
							{isExpanded ? (
								<HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4" />
							) : (
								<HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
							)}
						</Button>
					) : (
						<Button
							size="sm"
							variant="default"
							onClick={onExplain}
							disabled={isLoading}
							className="rounded-xl h-9 px-4 font-black text-xs  tracking-wider"
						>
							{isLoading ? (
								<HugeiconsIcon icon={Loading03Icon} className="h-3.5 w-3.5 mr-2 animate-spin" />
							) : (
								<HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 mr-2" />
							)}
							Explain
						</Button>
					)}
				</div>

				<AnimatePresence>
					{explanation && isExpanded && (
						<m.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: DURATION.normal, ease: EASING.easeInOut }}
						>
							<div className="pt-4">
								<Separator className="mb-4" />
								<MarkdownRenderer content={explanation} className="prose-sm" />
								<div className="mt-4 flex items-center justify-between">
									<p className="text-[9px] font-bold text-muted-foreground  tracking-[0.2em]">
										AI-generated explanation
									</p>
									<Button
										variant="link"
										size="sm"
										className="h-auto p-0 text-[10px] font-black  tracking-widest text-primary/60 hover:text-primary"
										onClick={onExplain}
										disabled={isLoading}
									>
										Regenerate
									</Button>
								</div>
							</div>
						</m.div>
					)}
				</AnimatePresence>

				{isLoading && !explanation && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="py-8 flex flex-col items-center justify-center space-y-3"
					>
						<div className="flex gap-1.5">
							<m.span
								animate={{ y: [0, -6, 0] }}
								transition={{
									duration: 0.6,
									repeat: Number.POSITIVE_INFINITY,
									ease: [0.16, 1, 0.3, 1],
									delay: 0,
								}}
								className="w-2 h-2 bg-primary/40 rounded-full"
							/>
							<m.span
								animate={{ y: [0, -6, 0] }}
								transition={{
									duration: 0.6,
									repeat: Number.POSITIVE_INFINITY,
									ease: [0.16, 1, 0.3, 1],
									delay: 0.15,
								}}
								className="w-2 h-2 bg-primary/60 rounded-full"
							/>
							<m.span
								animate={{ y: [0, -6, 0] }}
								transition={{
									duration: 0.6,
									repeat: Number.POSITIVE_INFINITY,
									ease: [0.16, 1, 0.3, 1],
									delay: 0.3,
								}}
								className="w-2 h-2 bg-primary/80 rounded-full"
							/>
						</div>
						<p className="text-[10px] font-black  tracking-[0.2em] text-muted-foreground animate-pulse">
							Understanding the question...
						</p>
					</m.div>
				)}
			</div>
		</Card>
	);
}
