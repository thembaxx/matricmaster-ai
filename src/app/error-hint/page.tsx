import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { appConfig } from '@/app.config';

const ErrorHintScreen = dynamic(() => import('@/screens/ErrorHint'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Error Hint | ${appConfig.name} AI`,
	description: 'Get hints and explanations for quiz questions.',
};

export default function ErrorHintPage() {
	return <ErrorHintScreen />;
}
