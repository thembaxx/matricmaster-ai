import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import ErrorHintScreen from '@/screens/ErrorHint';

export const metadata: Metadata = {
	title: `Error Hint | ${appConfig.name} AI`,
	description: 'Get hints and explanations for quiz questions.',
};

export default function ErrorHintPage() {
	return <ErrorHintScreen />;
}
