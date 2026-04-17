import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import ExamRunner from './ExamRunner';

export default async function ExamRunnerPage({
	params,
	searchParams,
}: {
	params: Promise<{ examId: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) redirect('/login');

	const { examId } = await params;
	const resolvedParams = await searchParams;

	const subject = typeof resolvedParams.subject === 'string' ? resolvedParams.subject : '';
	const papers = typeof resolvedParams.papers === 'string' ? resolvedParams.papers.split(',') : [];
	const questions = typeof resolvedParams.questions === 'string' ? resolvedParams.questions : '20';
	const time =
		typeof resolvedParams.time === 'string' ? Number.parseInt(resolvedParams.time, 10) : 120;
	const weakTopics = resolvedParams.weakTopics === '1';

	return (
		<ExamRunner
			examId={examId}
			userId={session.user.id}
			subject={subject}
			papers={papers}
			questionCount={questions === 'all' ? null : Number.parseInt(questions, 10)}
			timeLimit={time}
			includeWeakTopics={weakTopics}
		/>
	);
}
