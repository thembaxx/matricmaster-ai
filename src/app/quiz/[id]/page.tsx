import dynamic from 'next/dynamic';
import { QUIZ_DATA } from '@/constants/quiz-data';
import QuizScreen from '@/screens/Quiz';

export async function generateStaticParams() {
	return Object.keys(QUIZ_DATA).map((id) => ({
		id,
	}));
}

export default function QuizPage({ params }: { params: { id: string } }) {
	return <QuizScreen quizId={params.id} />;
}
