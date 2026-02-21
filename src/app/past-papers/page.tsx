import type { Metadata } from 'next';
import PastPapersScreen from '@/screens/PastPapers';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: 'Past Papers | MatricMaster AI',
	description: 'Access NSC past papers with AI-powered explanations.',
	alternates: { canonical: `${baseUrl}/past-papers` },
};

export default function PastPapersPage() {
	return (
		<div className="bg-red-600">
			<PastPapersScreen />
		</div>
	);
}
