import type { Metadata } from 'next';
import Landing from '@/screens/Landing';

export const metadata: Metadata = {
	title: 'MatricMaster - Master Your Matric Exams',
	description:
		'Master your Matric exams through interactive practice. Access past papers, step-by-step guides, and personalized explanations for South African Grade 12 students.',
};

export default function HomePage() {
	return <Landing />;
}
