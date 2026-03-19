'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataSection } from '@/components/ui/data-loader';
import { cn } from '@/lib/utils';

interface Question {
	id: string;
	topic: string;
	difficulty: string;
	marks: number;
	questionText: string;
}

interface QuestionsListProps {
	questions: Question[];
}

export function QuestionsList({ questions }: QuestionsListProps) {
	return (
		<DataSection title="Sample Questions" description="Example quiz questions from our database">
			<div className="space-y-4">
				{questions.slice(0, 5).map((question) => (
					<Card key={question.id} className="hover:shadow-md transition-shadow">
						<CardContent className="pt-4">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<Badge variant="outline" className="text-xs">
											{question.topic}
										</Badge>
										<Badge
											variant="secondary"
											className={cn(
												'text-xs',
												question.difficulty === 'easy' && 'bg-green-500/10 text-green-600',
												question.difficulty === 'medium' && 'bg-yellow-500/10 text-yellow-600',
												question.difficulty === 'hard' && 'bg-red-500/10 text-red-600'
											)}
										>
											{question.difficulty}
										</Badge>
										<span className="text-xs text-muted-foreground">{question.marks} marks</span>
									</div>
									<p className="text-sm">{question.questionText}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</DataSection>
	);
}
