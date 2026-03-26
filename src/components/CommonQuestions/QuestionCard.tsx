'use client';

import { FluentEmoji } from '@lobehub/fluent-emoji';
import { m } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { CommonQuestion } from '@/content/common-questions';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
	question: CommonQuestion;
	index: number;
	onClick: (question: CommonQuestion) => void;
}

export function QuestionCard({ question, index, onClick }: QuestionCardProps) {
	return (
		<m.div
			key={question.id}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.03 }}
		>
			<Card
				className="p-5 cursor-pointer hover:shadow-lg transition-all rounded-2xl border bg-card shadow-sm"
				onClick={() => onClick(question)}
			>
				<div className="flex items-start gap-4">
					<div
						className={cn(
							'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
							question.bgColor
						)}
					>
						<FluentEmoji type="3d" emoji={question.fluentEmoji} size={24} className="w-6 h-6" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<span className={cn('text-xs font-medium', question.color)}>
								{question.subjectLabel}
							</span>
							<span className="text-xs text-muted-foreground">•</span>
							<span className="text-xs text-muted-foreground">{question.topic}</span>
						</div>
						<p className="text-sm font-medium line-clamp-2 mb-2">{question.question}</p>
						<div className="flex items-center gap-3 text-xs text-muted-foreground">
							<span className="flex items-center gap-1">
								<span className="font-medium">Grade</span> {question.grades.join(', ')}
							</span>
							<span className="flex items-center gap-1">
								<span className="font-medium">Years:</span> {question.years.join(', ')}
							</span>
						</div>
					</div>
				</div>
			</Card>
		</m.div>
	);
}
