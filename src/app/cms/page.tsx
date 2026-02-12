import type { Metadata } from 'next';
import CMSScreen from '@/screens/CMS';

export const metadata: Metadata = {
	title: 'CMS | MatricMaster AI',
	description: 'Content management system for administrators.',
};

export default function CMSPage() {
	return <CMSScreen />;
}
