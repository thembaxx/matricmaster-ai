'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export type QuizTopicData = {
	id: string;
	title: string;
	subject: string;
	questions: number;
	difficulty: 'easy' | 'medium' | 'hard';
	paperId?: string;
	year?: number;
	month?: string;
	source?: 'pastPaper' | ' topic';
};

const defaultQuizzes: QuizTopicData[] = [
	{
		id: '1',
		title: 'Algebra Fundamentals',
		subject: 'Mathematics',
		questions: 20,
		difficulty: 'medium',
	},
	{
		id: '2',
		title: 'Force & Motion',
		subject: 'Physics',
		questions: 15,
		difficulty: 'hard',
	},
	{
		id: '3',
		title: 'Chemical Bonding',
		subject: 'Chemistry',
		questions: 25,
		difficulty: 'easy',
	},
	{
		id: '4',
		title: 'Cell Biology',
		subject: 'Life Sciences',
		questions: 18,
		difficulty: 'medium',
	},
];

async function fetchPastPaperQuizzes(): Promise<QuizTopicData[]> {
	try {
		const response = await fetch('/api/quiz/from-past-papers');
		if (!response.ok) return defaultQuizzes;
		const data = await response.json();
		return data.quizzes || [];
	} catch {
		return defaultQuizzes;
	}
}

export function useQuizTopics() {
	const { data: pastPaperQuizzes = [], isLoading } = useQuery({
		queryKey: ['quiz-topics', 'past-papers'],
		queryFn: fetchPastPaperQuizzes,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});

	const quizzes = useMemo(() => {
		if (pastPaperQuizzes.length > 0) {
			return [...pastPaperQuizzes, ...defaultQuizzes];
		}
		return defaultQuizzes;
	}, [pastPaperQuizzes]);

	return {
		quizzes,
		isLoading,
	};
}
