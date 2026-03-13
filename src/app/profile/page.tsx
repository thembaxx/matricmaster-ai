import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: `Profile | ${appConfig.name} AI`,
	description: 'Manage your account and view your learning statistics.',
	alternates: { canonical: `${baseUrl}/profile` },
	openGraph: {
		title: `My Profile | ${appConfig.name} AI`,
		description: 'Manage your account and view your learning statistics.',
		url: `${baseUrl}/profile`,
		type: 'profile',
	},
};

const ProfileScreen = dynamic(() => import('@/screens/Profile'), {
	loading: () => <ProfileSkeleton />,
});

export default function ProfilePage() {
	return <ProfileScreen />;
}
