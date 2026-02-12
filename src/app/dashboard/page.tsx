import type { Metadata } from 'next';
import DashboardScreen from '@/screens/Dashboard';

export const metadata: Metadata = {
	title: 'Dashboard | MatricMaster AI',
	description: 'Track your learning progress and continue your journey.',
};

export default function DashboardPage() {
	return <DashboardScreen />;
}
