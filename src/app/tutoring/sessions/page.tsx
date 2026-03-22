import type { Metadata } from 'next';
import MySessions from '@/screens/MySessions';

export const metadata: Metadata = {
	title: 'My Sessions - MatricMaster AI',
	description: 'Manage your tutoring sessions',
};

export default function MySessionsPage() {
	return <MySessions />;
}
