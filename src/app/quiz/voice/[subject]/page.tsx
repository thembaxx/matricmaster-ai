import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import VoiceQuiz from './VoiceQuiz';

export default async function VoiceQuizPage({ params }: { params: Promise<{ subject: string }> }) {
	const { subject } = await params;
	const auth = await getAuth();
	const session = await auth.api.getSession();

	if (!session?.user) {
		redirect('/login');
	}

	return <VoiceQuiz subject={subject} userId={session.user.id} />;
}
