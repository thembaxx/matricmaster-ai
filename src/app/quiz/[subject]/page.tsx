import Quiz from '@/screens/Quiz';

export default function SubjectQuizPage({ params }: { params: { subject: string } }) {
	return <Quiz subject={params.subject} />;
}
