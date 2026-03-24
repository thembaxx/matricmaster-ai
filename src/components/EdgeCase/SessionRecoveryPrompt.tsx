import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SessionRecoveryPromptProps {
	lastQuestionIndex: number;
	totalQuestions: number;
	onRecover: () => void;
	onStartFresh: () => void;
	className?: string;
}

export function SessionRecoveryPrompt({
	lastQuestionIndex,
	totalQuestions,
	onRecover,
	onStartFresh,
	className,
}: SessionRecoveryPromptProps) {
	return (
		<div
			className={cn(
				'flex items-center gap-4 p-4 rounded-xl border bg-card',
				'animate-in slide-in-from-top-4 duration-300',
				className
			)}
		>
			<div className="p-3 rounded-full bg-primary/10">
				<Clock className="h-6 w-6 text-primary" />
			</div>
			<div className="flex-1 min-w-0">
				<h4 className="font-medium">welcome back</h4>
				<p className="text-sm text-muted-foreground">
					continue from question {lastQuestionIndex + 1} of {totalQuestions}
				</p>
			</div>
			<div className="flex gap-2">
				<Button variant="secondary" size="sm" onClick={onStartFresh}>
					start fresh
				</Button>
				<Button size="sm" onClick={onRecover}>
					continue
				</Button>
			</div>
		</div>
	);
}
