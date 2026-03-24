'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookingDialog } from './BookingDialog';
import { ReviewsSection } from './ReviewsSection';
import { TutorInfoCard } from './TutorInfoCard';
import { TutorProfileLoading } from './TutorProfileLoading';
import { useTutorProfileData } from './useTutorProfileData';

interface TutorProfileProps {
	params: Promise<{ id: string }>;
}

export default function TutorProfile({ params }: TutorProfileProps) {
	const resolvedParams = use(params);
	const router = useRouter();
	const {
		tutor,
		reviews,
		isLoading,
		userXP,
		selectedSubject,
		setSelectedSubject,
		handleBookSession,
		xpCost,
		canAfford,
	} = useTutorProfileData({ tutorId: resolvedParams.id });

	if (isLoading || !tutor) {
		return <TutorProfileLoading isLoading={isLoading} tutor={tutor} />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-4xl mx-auto w-full pt-6 space-y-6 relative z-10">
				<Button variant="ghost" className="gap-2" onClick={() => router.back()}>
					← Back
				</Button>

				<Card className="p-6 rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm">
					<TutorInfoCard tutor={tutor} />

					<div className="mt-6 pt-6 border-t">
						<BookingDialog
							tutor={tutor}
							userXP={userXP}
							selectedSubject={selectedSubject}
							onSubjectChange={setSelectedSubject}
							onBook={handleBookSession}
							xpCost={xpCost}
							canAfford={canAfford}
						/>
					</div>
				</Card>

				<ReviewsSection reviews={reviews} />
			</main>
		</div>
	);
}
