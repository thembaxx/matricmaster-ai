import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InteractiveQuizClient } from '@/components/InteractiveQuizClient';
import PageTransition from '@/components/Transition/PageTransition';
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
			title: 'Interactive Quiz | MatricMaster',
			description: 'Test your knowledge with expert-guided interactive quizzes.',
		};
	}

	return {
		title: `${quiz.title} | MatricMaster`,
		description: `Interactive ${quiz.subject} quiz: ${quiz.title}. Get instant feedback and expert explanations.`,
		openGraph: {
			title: `${quiz.title} | MatricMaster`,
			description: `Interactive ${quiz.subject} quiz: ${quiz.title}. Get instant feedback and expert explanations.`,
			type: 'website',
		},
	};
}

export default async function InteractiveQuizPage({ searchParams }: PageProps) {
	const { id } = await searchParams;

	return (
		<PageTransition>
			<Suspense fallback={<QuizSkeleton />}>
				<InteractiveQuizClient initialId={id} />
			</Suspense>
		</PageTransition>
	);
}
