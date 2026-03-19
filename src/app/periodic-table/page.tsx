import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';

const PeriodicTableScreen = dynamic(() => import('@/screens/PeriodicTable'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Periodic Table | ${appConfig.name} AI`,
	description: 'Interactive periodic table for Grade 12 Chemistry students.',
};

export default function PeriodicTablePage() {
	return <PeriodicTableScreen />;
}
