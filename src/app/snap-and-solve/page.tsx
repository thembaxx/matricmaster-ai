import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import SnapAndSolveScreen from '@/screens/SnapAndSolve';

export const metadata: Metadata = {
	title: `Snap & Solve | ${appConfig.name}`,
	description: 'Snap a photo of any NSC question and get instant step-by-step solutions.',
};

export default function SnapAndSolvePage() {
	return <SnapAndSolveScreen />;
}
