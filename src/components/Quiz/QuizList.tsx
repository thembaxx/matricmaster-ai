'use client';

import { QuestionIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuizTopics } from '@/hooks/useQuizTopics';

interface QuizListProps {
	searchQuery?: string;
}

export default function QuizList({ searchQuery = '' }: QuizListProps) {
	const router = useRouter();
	const [localSearch, setLocalSearch] = useState(searchQuery);
	const { quizzes } = useQuizTopics();

	const filteredQuizzes = useMemo(
		() =>
			quizzes.filter(
				(quiz: { title: string; subject: string }) =>
					quiz.title.toLowerCase().includes(localSearch.toLowerCase()) ||
					quiz.subject.toLowerCase().includes(localSearch.toLowerCase())
			),
		[quizzes, localSearch]
	);

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-500/20 text-green-600 border-green-500/30';
			case 'medium':
				return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
			case 'hard':
				return 'bg-red-500/20 text-red-600 border-red-500/30';
			default:
				return 'bg-muted text-muted-foreground';
		}
	};

	const handleQuizClick = (quizId: string) => {
		router.push(`/quiz/${quizId}`);
	};

	return (
		<div className="space-y-6">
			<div className="relative">
				<HugeiconsIcon
					icon={Search01Icon}
					className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
				/>
				<Input
					placeholder="search quizzes..."
					className="pl-11 h-12 rounded-2xl bg-muted/30 border-none"
					value={localSearch}
					onChange={(e) => setLocalSearch(e.target.value)}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{filteredQuizzes.map((quiz) => (
					<div
						key={quiz.id}
						role="button"
						tabIndex={0}
						onClick={() => handleQuizClick(quiz.id)}
						onKeyDown={(e) => e.key === 'Enter' && handleQuizClick(quiz.id)}
						className="p-6 rounded-3xl border border-border hover:border-primary/20 hover:shadow-soft-lg transition-all duration-500 group cursor-pointer bg-card/50 backdrop-blur-sm"
					>
						<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
							<HugeiconsIcon icon={QuestionIcon} className="w-6 h-6 text-primary" />
						</div>
						<h3 className="text-lg font-black text-foreground tracking-tight mb-2">{quiz.title}</h3>
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline" className="rounded-lg font-bold text-xs">
								{quiz.subject}
							</Badge>
							<Badge
								className={`rounded-lg font-bold text-xs ${getDifficultyColor(quiz.difficulty)}`}
							>
								{quiz.difficulty}
							</Badge>
							<span className="text-sm font-medium text-muted-foreground">
								{quiz.questions} questions
							</span>
						</div>
					</div>
				))}
			</div>

			{filteredQuizzes.length === 0 && (
				<div className="text-center py-12">
					<div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
						<HugeiconsIcon icon={QuestionIcon} className="w-8 h-8 text-muted-foreground" />
					</div>
					<p className="text-muted-foreground font-medium mb-2">
						No quizzes found matching "{localSearch}"
					</p>
					<p className="text-muted-foreground/60 text-sm">
						try adjusting your search or browse all quizzes
					</p>
				</div>
			)}
		</div>
	);
}
