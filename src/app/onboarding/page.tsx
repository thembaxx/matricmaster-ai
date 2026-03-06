import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import OnboardingScreen from '@/screens/Onboarding';

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

	return <OnboardingScreen user={user} />;
}
