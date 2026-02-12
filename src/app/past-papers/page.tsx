import type { Metadata } from 'next';
import PastPapersScreen from '@/screens/PastPapers';

export const metadata: Metadata = {
	title: 'Past Papers | MatricMaster AI',
	description: 'Access NSC past papers with AI-powered explanations.',
};

export default function PastPapersPage() {
	return <PastPapersScreen />;
}
