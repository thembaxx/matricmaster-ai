'use client';

import { BookOpen01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CachedTask } from '@/lib/offline/task-cache';

const TASK_TYPE_LABELS: Record<string, string> = {
	lesson: 'Lesson',
	quiz: 'Quiz',
	flashcards: 'Flashcards',
	'past-paper': 'Past Paper',
};

interface CachedTasksListProps {
	tasks: CachedTask[];
}

export function CachedTasksList({ tasks }: CachedTasksListProps) {
	if (tasks.length === 0) return null;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5 text-brand-blue" />
					Cached Tasks ({tasks.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{tasks.map((task) => (
					<div
						key={task.id}
						className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
					>
						<div className="flex items-center gap-3 min-w-0">
							{task.completed ? (
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-5 h-5 text-green-500 shrink-0"
								/>
							) : (
								<div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
							)}
							<div className="min-w-0">
								<div className="font-medium text-sm truncate">{task.title}</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span>{task.subject}</span>
									<span>•</span>
									<Badge variant="secondary" className="text-[10px] h-4 px-1.5">
										{TASK_TYPE_LABELS[task.type] ?? task.type}
									</Badge>
								</div>
							</div>
						</div>
						<Badge variant="outline" className="text-[10px] shrink-0">
							Available Offline
						</Badge>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
