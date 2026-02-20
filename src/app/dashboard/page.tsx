'use client';

import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

const DashboardScreen = dynamic(() => import('@/screens/Dashboard'), {
	ssr: false,
	loading: () => <DashboardSkeleton />,
});

export default function DashboardPage() {
	return <DashboardScreen />;
}
