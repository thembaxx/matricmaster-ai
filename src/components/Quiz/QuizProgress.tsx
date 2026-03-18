'use client';

import { m } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface QuizProgressProps {
	currentQuestion: number;
	totalQuestions: number;
	difficulty: string;
	progressPercent: number;
}

export function QuizProgress({
	currentQuestion,
	totalQuestions,
	difficulty,
	progressPercent,
}: QuizProgressProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			className="mb-6"
		>
			<div className="flex justify-between items-center mb-2">
				<span className="text-[10px] font-medium text-muted-foreground">
					Question {currentQuestion} of {totalQuestions}
				</span>
				<Badge variant="secondary" className="text-[10px] font-medium rounded-full px-3">
					{difficulty}
				</Badge>
			</div>
			<Progress value={progressPercent} className="h-2 rounded-full" />
		</m.div>
	);
}
