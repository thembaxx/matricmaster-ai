import dynamicImport from 'next/dynamic';
import { headers } from 'next/headers';
import type { SessionUser } from '@/lib/auth';
import { getAuth } from '@/lib/auth';

const OnboardingScreen = dynamicImport(() => import('@/screens/Onboarding'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
	// Try to get session, but don't crash if it fails in a dev/mock environment
	let user = null;
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		user = session?.user;
	} catch (e) {
		console.warn('Auth check failed in OnboardingPage:', e);
	}

	return <OnboardingScreen user={user as SessionUser} />;
}
