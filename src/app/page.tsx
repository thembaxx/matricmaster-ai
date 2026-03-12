import type { Metadata } from 'next';
import Landing from '@/screens/Landing';
import { appConfig } from '../app.config';

export const metadata: Metadata = {
	title: `${appConfig.name} - Master Your Matric Exams`,
	description: appConfig.description,
};

export default function HomePage() {
	return <Landing />;
}
