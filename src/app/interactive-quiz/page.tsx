import type { Metadata } from 'next';
import { Suspense } from 'react';

import { appConfig } from '@/app.config';
import { InteractiveQuizClient } from '@/components/InteractiveQuizClient';
import { QuizSkeleton } from '@/components/QuizSkeleton';
import { QUIZ_DATA } from '@/constants/quiz-data';

interface PageProps {
	searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
	const { id } = await searchParams;
	const quiz = id ? QUIZ_DATA[id] : null;

	if (!quiz) {
		return {
			title: `Interactive Quiz | ${appConfig.name}`,
			description: 'Test your knowledge with interactive quizzes.',
		};
	}

	return {
		title: `${quiz.title} | ${appConfig.name}`,
		description: `Interactive ${quiz.subject} quiz: ${quiz.title}. Get instant feedback and detailed explanations.`,
		openGraph: {
			title: `${quiz.title} | ${appConfig.name} AI`,
			description: `Interactive ${quiz.subject} quiz: ${quiz.title}. Get instant feedback and AI explanations.`,
			type: 'website',
		},
	};
}

export default async function InteractiveQuizPage({ searchParams }: PageProps) {
	const { id } = await searchParams;

	return (
		<Suspense fallback={<QuizSkeleton />}>
			<InteractiveQuizClient initialId={id} />
		</Suspense>
	);
}
