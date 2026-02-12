import type { Metadata } from 'next';
import ErrorHintScreen from '@/screens/ErrorHint';

export const metadata: Metadata = {
	title: 'Error Hint | MatricMaster AI',
	description: 'Get hints and explanations for quiz questions.',
};

export default function ErrorHintPage() {
	return <ErrorHintScreen />;
}
