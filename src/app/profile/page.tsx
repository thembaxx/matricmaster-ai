import type { Metadata } from 'next';
import ProfileScreen from '@/screens/Profile';

export const metadata: Metadata = {
	title: 'Profile | MatricMaster AI',
	description: 'Manage your account and view your learning statistics.',
};

export default function ProfilePage() {
	return <ProfileScreen />;
}
