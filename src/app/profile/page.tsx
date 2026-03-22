import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: `Profile | ${appConfig.name}`,
	description: 'Manage your account and track your NSC exam preparation progress.',
	alternates: { canonical: `${baseUrl}/profile` },
	openGraph: {
		title: `My Profile | ${appConfig.name}`,
		description: 'Manage your account and view your matric exam prep progress.',
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
