import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import { requireAuth } from '@/lib/server-auth';
import { SocialHubScreen } from '@/screens/SocialHub';

export const metadata: Metadata = {
	title: `Social Hub | ${appConfig.name} AI`,
	description: 'Connect with study buddies, join focus rooms, and learn together.',
};

export default async function SocialHubPage() {
	const session = await requireAuth();
	const user = {
		id: session.user.id,
		name: session.user.name,
		image: session.user.image,
		email: session.user.email,
	};
	return <SocialHubScreen user={user as never} />;
}
