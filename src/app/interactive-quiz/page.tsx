import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
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
			title: 'Interactive Quiz | MatricMaster AI',
			description: 'Test your knowledge with AI-powered interactive quizzes.',
		};
	}

	return {
		title: `${quiz.title} | MatricMaster AI`,
		description: `Interactive ${quiz.subject} quiz: ${quiz.title}. Get instant feedback and AI explanations.`,
		openGraph: {
			title: `${quiz.title} | MatricMaster AI`,
			description: `Interactive ${quiz.subject} quiz: ${quiz.title}. Get instant feedback and AI explanations.`,
			type: 'website',
		},
	};
}

const InteractiveQuiz = dynamic(() => import('@/screens/InteractiveQuiz'), {
	ssr: false,
	loading: () => <QuizSkeleton />,
});

export default async function InteractiveQuizPage({ searchParams }: PageProps) {
	const { id } = await searchParams;

	return (
		<Suspense fallback={<QuizSkeleton />}>
			<InteractiveQuiz initialId={id} />
		</Suspense>
	);
}
