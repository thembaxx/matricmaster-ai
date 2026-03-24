'use client';

import { TutorProfile } from '@/components/TutorProfile';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function TutorProfilePage({ params }: PageProps) {
	return <TutorProfile params={params} />;
}
