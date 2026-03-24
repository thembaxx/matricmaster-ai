import { Brain, Flame, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
	metrics: {
		hintsUsed: number;
		questionsAnswered: number;
		streakDays: number;
	};
	className?: string;
}

export function ProgressIndicator({ metrics, className }: ProgressIndicatorProps) {
	const hintRatio =
		metrics.questionsAnswered > 0 ? metrics.hintsUsed / metrics.questionsAnswered : 0;

	return (
		<div className={cn('flex items-center gap-4 text-sm', className)}>
			<div className="flex items-center gap-1.5">
				<Brain className="h-4 w-4 text-muted-foreground" />
				<span>{metrics.questionsAnswered} questions</span>
			</div>

			<div className="flex items-center gap-1.5">
				<Lightbulb
					className={cn('h-4 w-4', hintRatio > 0.5 ? 'text-yellow-500' : 'text-muted-foreground')}
				/>
				<span>{metrics.hintsUsed} hints</span>
				{hintRatio > 0.5 && (
					<span className="text-xs text-yellow-600 dark:text-yellow-400">(overusing)</span>
				)}
			</div>

			<div className="flex items-center gap-1.5">
				<Flame className="h-4 w-4 text-orange-500" />
				<span>{metrics.streakDays} day streak</span>
			</div>
		</div>
	);
}
