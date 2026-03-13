import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import PeriodicTableScreen from '@/screens/PeriodicTable';

export const metadata: Metadata = {
	title: `Periodic Table | ${appConfig.name} AI`,
	description: 'Interactive periodic table for Grade 12 Chemistry students.',
};

export default function PeriodicTablePage() {
	return <PeriodicTableScreen />;
}
