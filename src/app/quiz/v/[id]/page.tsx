import Quiz from '@/screens/Quiz';

export default async function DirectQuizPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <Quiz quizId={id} />;
}
