import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUnifiedUserStats } from '@/actions/get-unified-user-stats';
import { appConfig } from '@/app.config';
import { ProgressHub } from '@/components/UserHub/ProgressHub';
import { getAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: `My Progress Hub | ${appConfig.name} AI`,
	description: 'Track all your learning progress in one place.',
};

export default async function UserHubPage() {
	const auth = await getAuth();
	const session = await auth.api.getSession();
	if (!session?.user) {
		redirect('/login');
	}

	const stats = await getUnifiedUserStats();

	return <ProgressHub stats={stats} session={session} />;
}
