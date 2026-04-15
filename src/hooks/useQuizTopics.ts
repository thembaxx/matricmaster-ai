'use client';

import { useMemo } from 'react';

export type QuizTopicData = {
	id: string;
	title: string;
	subject: string;
	questions: number;
	difficulty: 'easy' | 'medium' | 'hard';
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

export function useQuizTopics() {
	const quizzes = useMemo(() => defaultQuizzes, []);

	return {
		quizzes,
		isLoading: false,
	};
}
