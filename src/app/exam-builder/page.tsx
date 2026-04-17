import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import ExamBuilder from './ExamBuilder';

export const dynamic = 'force-dynamic';

export default async function ExamBuilderPage() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) redirect('/login');

	return <ExamBuilder userId={session.user.id} />;
}
