'use client';

import { Calendar, CheckCircle, GraduationCap, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewDialog } from './ReviewDialog';
import { SessionCard } from './SessionCard';
import { SessionSkeleton } from './SessionSkeleton';
import { useMySessionsData } from './useMySessionsData';

export default function MySessions() {
	const router = useRouter();
	const {
		isLoading,
		userId,
		upcomingAsStudent,
		upcomingAsTutor,
		pastSessions,
		handleConfirmSession,
		handleCancelSession,
		handleSubmitReview,
		formatDate,
		formatTime,
	} = useMySessionsData();

	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [reviewSessionId, setReviewSessionId] = useState('');

	const handleOpenReview = (sessionId: string) => {
		setReviewSessionId(sessionId);
		setReviewDialogOpen(true);
	};

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-4xl mx-auto w-full pt-6 space-y-6 relative z-10">
				<div>
					<h1 className="text-2xl font-black tracking-tight">My Sessions</h1>
					<p className="text-sm text-muted-foreground mt-1">Manage your tutoring sessions</p>
				</div>

				{isLoading ? (
					<SessionSkeleton />
				) : (
					<Tabs defaultValue="upcoming" className="w-full">
						<TabsList className="w-full">
							<TabsTrigger value="upcoming" className="flex-1 gap-2">
								<Calendar className="size-4" />
								Upcoming
							</TabsTrigger>
							<TabsTrigger value="past" className="flex-1 gap-2">
								<CheckCircle className="size-4" />
								Past
							</TabsTrigger>
						</TabsList>

						<TabsContent value="upcoming" className="mt-4 space-y-6">
							<div>
								<h3 className="font-bold text-sm mb-3 flex items-center gap-2">
									<GraduationCap className="size-4" />
									As Student
								</h3>
								{upcomingAsStudent.length === 0 ? (
									<Card className="p-6 text-center">
										<p className="text-sm text-muted-foreground">No upcoming sessions as student</p>
										<Button
											variant="outline"
											className="mt-3"
											onClick={() => router.push('/marketplace')}
										>
											Browse Tutors
										</Button>
									</Card>
								) : (
									<div className="space-y-3">
										{upcomingAsStudent.map((session) => (
											<SessionCard
												key={session.id}
												session={session}
												isTutor={false}
												userId={userId}
												formatDate={formatDate}
												formatTime={formatTime}
												onConfirm={handleConfirmSession}
												onCancel={handleCancelSession}
												onLeaveReview={handleOpenReview}
											/>
										))}
									</div>
								)}
							</div>

							<div>
								<h3 className="font-bold text-sm mb-3 flex items-center gap-2">
									<GraduationCap className="size-4" />
									As Tutor
								</h3>
								{upcomingAsTutor.length === 0 ? (
									<Card className="p-6 text-center">
										<p className="text-sm text-muted-foreground">No upcoming sessions as tutor</p>
									</Card>
								) : (
									<div className="space-y-3">
										{upcomingAsTutor.map((session) => (
											<SessionCard
												key={session.id}
												session={session}
												isTutor={true}
												userId={userId}
												formatDate={formatDate}
												formatTime={formatTime}
												onConfirm={handleConfirmSession}
												onCancel={handleCancelSession}
												onLeaveReview={handleOpenReview}
											/>
										))}
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="past" className="mt-4">
							{pastSessions.length === 0 ? (
								<Card className="p-6 text-center">
									<MessageSquare className="size-8 mx-auto text-muted-foreground mb-2" />
									<p className="text-sm text-muted-foreground">No past sessions</p>
								</Card>
							) : (
								<div className="space-y-3">
									{pastSessions.map((session) => (
										<SessionCard
											key={session.id}
											session={session}
											isTutor={session.tutorId === userId}
											userId={userId}
											formatDate={formatDate}
											formatTime={formatTime}
											onConfirm={handleConfirmSession}
											onCancel={handleCancelSession}
											onLeaveReview={handleOpenReview}
										/>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				)}

				<ReviewDialog
					isOpen={reviewDialogOpen}
					onOpenChange={setReviewDialogOpen}
					sessionId={reviewSessionId}
					onSubmit={handleSubmitReview}
				/>
			</main>
		</div>
	);
}
