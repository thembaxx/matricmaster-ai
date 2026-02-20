import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Dashboard | MatricMaster AI',
	description: 'Track your learning progress and continue your journey.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
