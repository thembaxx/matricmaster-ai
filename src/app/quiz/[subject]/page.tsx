import Quiz from '@/screens/Quiz';

export default async function SubjectQuizPage({
	params,
}: {
	params: Promise<{ subject: string }>;
}) {
	const { subject } = await params;
	return <Quiz subject={subject} />;
}
