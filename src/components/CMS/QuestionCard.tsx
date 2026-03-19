import { Delete02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Question } from '@/lib/db/schema';
import { DifficultyBadge } from './StatusBadge';

interface QuestionCardProps {
	question: Question;
	subjectMap: Map<number, string>;
	onEdit: (question: Question) => void;
	onDelete: (id: string) => void;
}

export function QuestionCard({ question, subjectMap, onEdit, onDelete }: QuestionCardProps) {
	return (
		<Card
			key={question.id}
			className="rounded-[2rem] border-2 border-border/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group"
		>
			<CardContent className="p-6 space-y-6">
				<div className="flex items-start justify-between">
					<div className="flex flex-wrap gap-2">
						<DifficultyBadge difficulty={question.difficulty as 'easy' | 'medium' | 'hard'} />
						<Badge
							variant="outline"
							className="rounded-lg uppercase tracking-widest text-[9px] font-black"
						>
							Grade {question.gradeLevel}
						</Badge>
					</div>
					<div className="flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
									onClick={() => onEdit(question)}
									aria-label="Edit question"
								>
									<HugeiconsIcon icon={PencilEdit01Icon} className="h-5 w-5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Edit question</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
									onClick={() => onDelete(question.id)}
									aria-label="Delete question"
								>
									<HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Delete question</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<p className="text-sm font-bold text-foreground line-clamp-3 leading-relaxed">
					{question.questionText}
				</p>

				<div className="pt-4 border-t border-border/50 flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
							{subjectMap.get(question.subjectId) || 'Unknown'}
						</p>
						<p className="text-xs font-bold text-foreground truncate max-w-37.5">
							{question.topic}
						</p>
					</div>
					<div className="text-right">
						<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
							Points
						</p>
						<p className="text-lg font-black text-primary">{question.marks}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
