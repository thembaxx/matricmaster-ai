import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import ParentDashboardScreen from '@/screens/ParentDashboard';

export const metadata: Metadata = {
	title: `Parent Portal | ${appConfig.name} AI`,
	description: 'Monitor student progress, study time, and academic performance.',
};

export default function ParentDashboardPage() {
	return <ParentDashboardScreen />;
}
