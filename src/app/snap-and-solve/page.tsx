import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { appConfig } from '@/app.config';
import { SnapAndSolveWrapper } from '@/components/AI/SnapAndSolveWrapper';

const SnapAndSolveScreen = dynamic(() => import('@/screens/SnapAndSolve'), {
	ssr: true,
	loading: () => <div className="min-h-[60vh]" />,
});

export const metadata: Metadata = {
	title: `Snap & Solve | ${appConfig.name}`,
	description: 'Snap a photo of any NSC question and get instant step-by-step solutions.',
};

export default function SnapAndSolvePage() {
	return (
		<SnapAndSolveWrapper>
			<SnapAndSolveScreen />
		</SnapAndSolveWrapper>
	);
}
