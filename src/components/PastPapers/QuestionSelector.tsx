'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ExtractedQuestionPreview {
	id: string;
	questionNumber: string;
	questionText: string;
	marks: number;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	hasOptions: boolean;
	subQuestionsCount: number;
}

interface QuestionSelectorProps {
	questions: ExtractedQuestionPreview[];
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
	maxSelection?: number;
	className?: string;
}

const difficultyColors = {
	easy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
	medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
	hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export function QuestionSelector({
	questions,
	selectedIds,
	onSelectionChange,
	maxSelection,
	className,
}: QuestionSelectorProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [filterTopic, setFilterTopic] = useState<string>('all');
	const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

	const topics = useMemo(() => {
		const topicSet = new Set(questions.map((q) => q.topic));
		return Array.from(topicSet).sort();
	}, [questions]);

	const filteredQuestions = useMemo(() => {
		return questions.filter((q) => {
			const matchesSearch =
				searchQuery === '' ||
				q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
				q.questionNumber.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesTopic = filterTopic === 'all' || q.topic === filterTopic;
			const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
			return matchesSearch && matchesTopic && matchesDifficulty;
		});
	}, [questions, searchQuery, filterTopic, filterDifficulty]);

	const handleToggle = (id: string) => {
		const isSelected = selectedIds.includes(id);
		let newIds: string[];

		if (isSelected) {
			newIds = selectedIds.filter((sid) => sid !== id);
		} else {
			if (maxSelection && selectedIds.length >= maxSelection) {
				return;
			}
			newIds = [...selectedIds, id];
		}

		onSelectionChange(newIds);
	};

	const handleSelectAll = () => {
		if (maxSelection) {
			onSelectionChange(filteredQuestions.slice(0, maxSelection).map((q) => q.id));
		} else {
			onSelectionChange(filteredQuestions.map((q) => q.id));
		}
	};

	const handleClearSelection = () => {
		onSelectionChange([]);
	};

	return (
		<div className={cn('space-y-4', className)}>
			<div className="flex flex-wrap gap-2 items-center">
				<Input
					type="search"
					placeholder="Search questions..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-9 w-48"
				/>

				<select
					value={filterTopic}
					onChange={(e) => setFilterTopic(e.target.value)}
					className="h-9 px-3 rounded-md border border-input bg-background text-sm"
				>
					<option value="all">All topics</option>
					{topics.map((topic) => (
						<option key={topic} value={topic}>
							{topic}
						</option>
					))}
				</select>

				<select
					value={filterDifficulty}
					onChange={(e) => setFilterDifficulty(e.target.value)}
					className="h-9 px-3 rounded-md border border-input bg-background text-sm"
				>
					<option value="all">All difficulties</option>
					<option value="easy">Easy</option>
					<option value="medium">Medium</option>
					<option value="hard">Hard</option>
				</select>

				<div className="flex-1" />

				<Button variant="outline" size="sm" onClick={handleSelectAll}>
					Select all
				</Button>
				<Button variant="ghost" size="sm" onClick={handleClearSelection}>
					Clear
				</Button>
			</div>

			<div className="text-sm text-muted-foreground">
				{selectedIds.length} of {maxSelection ? `${maxSelection} max, ` : ''}
				{filteredQuestions.length} questions selected
			</div>

			<div className="space-y-2 max-h-96 overflow-y-auto">
				{filteredQuestions.map((question) => {
					const isSelected = selectedIds.includes(question.id);
					const isDisabled = maxSelection && !isSelected && selectedIds.length >= maxSelection;

					return (
						<div
							key={question.id}
							className={cn(
								'flex items-start gap-3 p-3 rounded-lg border transition-colors',
								isSelected
									? 'bg-primary/5 border-primary/30'
									: 'bg-card border-border hover:border-primary/20',
								isDisabled && 'opacity-50 cursor-not-allowed'
							)}
						>
							<Checkbox
								checked={isSelected}
								onCheckedChange={() => !isDisabled && handleToggle(question.id)}
								disabled={isDisabled}
							/>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-medium text-sm">Q{question.questionNumber}</span>
									<Badge variant="outline" className="text-[10px]">
										{question.marks} marks
									</Badge>
									<Badge
										variant="outline"
										className={cn('text-[10px]', difficultyColors[question.difficulty])}
									>
										{question.difficulty}
									</Badge>
									{question.hasOptions && (
										<Badge variant="secondary" className="text-[10px]">
											MCQ
										</Badge>
									)}
									{question.subQuestionsCount > 0 && (
										<Badge variant="secondary" className="text-[10px]">
											{question.subQuestionsCount} sub-questions
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground line-clamp-2">
									{question.questionText}
								</p>
								<div className="text-xs text-muted-foreground mt-1">{question.topic}</div>
							</div>
						</div>
					);
				})}
			</div>

			{filteredQuestions.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					No questions match your filters
				</div>
			)}
		</div>
	);
}
