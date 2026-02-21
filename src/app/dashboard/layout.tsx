import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Dashboard | MatricMaster AI',
	description: 'Track your learning progress and continue your journey.',
	alternates: { canonical: `${baseUrl}/dashboard` },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
