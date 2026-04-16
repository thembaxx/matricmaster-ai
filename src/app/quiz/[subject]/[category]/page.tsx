import Quiz from '@/screens/Quiz';

export default async function CategoryQuizPage({
	params
}: {
	params: Promise<{ subject: string; category: string }>
}) {
	const { subject, category } = await params;
	return <Quiz subject={subject} category={category} />;
}
