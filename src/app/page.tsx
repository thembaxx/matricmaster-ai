import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '../app.config';

const Landing = dynamic(() => import('@/screens/Landing'), {
	loading: () => (
		<div className="min-h-screen flex items-center justify-center">
			<div className="animate-pulse bg-muted rounded-lg h-96 w-full max-w-4xl mx-4" />
		</div>
	),
});

export const metadata: Metadata = {
	title: `${appConfig.name.toLowerCase()} - master your matric exams`,
	description: appConfig.description,
};

export default function HomePage() {
	return <Landing />;
}
