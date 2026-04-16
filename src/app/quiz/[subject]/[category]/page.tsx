import Quiz from '@/screens/Quiz';

export default function CategoryQuizPage({
	params
}: {
	params: { subject: string; category: string }
}) {
	return <Quiz subject={params.subject} category={params.category} />;
}
