import { CheckmarkCircle02Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Word {
	id: string;
	text: string;
}

interface WordTranscriptionProps {
	transcriptionRef: React.RefObject<HTMLDivElement | null>;
	handleCopyText: () => void;
	copied: boolean;
	words: Word[];
	handleWordClick: (index: number) => void;
	activeWordIndex: number;
}

export function WordTranscription({
	transcriptionRef,
	handleCopyText,
	copied,
	words,
	handleWordClick,
	activeWordIndex,
}: WordTranscriptionProps) {
	return (
		<div
			ref={transcriptionRef}
			className="flex-1 min-h-0 overflow-y-auto py-3 mt-1 bg-gradient-to-br from-muted/25 via-muted/15 to-muted/30 rounded-xl p-4"
		>
			<div className="flex justify-end mb-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleCopyText}
					className={cn(
						'text-xs gap-1.5 transition-all duration-200 hover:bg-muted/60',
						copied && 'text-green-600 dark:text-green-400'
					)}
				>
					<HugeiconsIcon
						icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
						className="w-3.5 h-3.5"
					/>
					{copied ? 'Copied!' : 'Copy'}
				</Button>
			</div>
			<p className="text-sm leading-7 text-foreground/90">
				{words.map((word, index) => (
					<span
						key={word.id}
						data-word-index={index}
						role="button"
						aria-label={`Play word: ${word.text}`}
						tabIndex={0}
						onClick={() => handleWordClick(index)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleWordClick(index);
							}
						}}
						className={cn(
							'transition-all duration-200 cursor-pointer inline-block rounded-md px-0.5 -mx-0.5',
							'hover:text-primary hover:bg-primary/8',
							'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
							activeWordIndex === index
								? 'bg-primary/20 text-primary font-semibold scale-[1.02] shadow-sm'
								: 'text-foreground/90'
						)}
					>
						{word.text}{' '}
					</span>
				))}
			</p>
		</div>
	);
}
