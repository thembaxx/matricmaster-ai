import Quiz from '@/screens/Quiz';

export default function DirectQuizPage({ params }: { params: { id: string } }) {
	return <Quiz quizId={params.id} />;
}
