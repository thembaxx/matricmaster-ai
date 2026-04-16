'use client';

import { useFeatureIntegration } from '@/hooks/useFeatureIntegration';

export function FeatureIntegrationProvider({ children }: { children: React.ReactNode }) {
	useFeatureIntegration();
	return <>{children}</>;
}
