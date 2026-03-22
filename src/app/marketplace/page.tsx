import type { Metadata } from 'next';
import Marketplace from '@/screens/Marketplace';

export const metadata: Metadata = {
	title: 'Tutor Marketplace - MatricMaster AI',
	description: 'Find peer tutors for extra help with your subjects',
};

export default function MarketplacePage() {
	return <Marketplace />;
}
