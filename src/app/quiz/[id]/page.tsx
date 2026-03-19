import dynamic from 'next/dynamic';
import { QUIZ_DATA } from '@/constants/quiz-data';

const QuizScreen = dynamic(() => import('@/screens/Quiz'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export async function generateStaticParams() {
	return Object.keys(QUIZ_DATA).map((id) => ({
		id,
	}));
}

export default function QuizPage({ params }: { params: { id: string } }) {
	return <QuizScreen quizId={params.id} />;
}
