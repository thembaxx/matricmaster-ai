'use client';

import {
	Calendar,
	CheckCircle,
	Clock,
	GraduationCap,
	MessageSquare,
	Star,
	Video,
	X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface TutoringSession {
	id: string;
	tutorId: string;
	studentId: string;
	tutorName: string | null;
	tutorImage: string | null;
	studentName: string | null;
	studentImage: string | null;
	subject: string;
	scheduledAt: string;
	durationMinutes: number;
	status: string;
	xpPaid: number;
	xpEarned: number;
	roomUrl: string | null;
	studentConfirmed: boolean;
	tutorConfirmed: boolean;
	completedAt: string | null;
}

export default function MySessions() {
	const router = useRouter();
	const [sessions, setSessions] = useState<TutoringSession[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userId, _setUserId] = useState<string | null>(null);

	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [reviewSessionId, setReviewSessionId] = useState('');
	const [reviewRating, setReviewRating] = useState(5);
	const [reviewComment, setReviewComment] = useState('');
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);

	useEffect(() => {
		const fetchSessions = async () => {
			setIsLoading(true);
			try {
				const response = await fetch('/api/marketplace?action=my-sessions&asRole=both');
				const data = await response.json();

				if (data.success) {
					setSessions(data.data);
				}
			} catch (error) {
				console.error('Error fetching sessions:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSessions();
	}, []);

	const upcomingAsStudent = sessions.filter(
		(s) =>
			s.studentId === userId &&
			['pending', 'confirmed'].includes(s.status) &&
			new Date(s.scheduledAt) > new Date()
	);

	const upcomingAsTutor = sessions.filter(
		(s) =>
			s.tutorId === userId &&
			['pending', 'confirmed'].includes(s.status) &&
			new Date(s.scheduledAt) > new Date()
	);

	const pastSessions = sessions.filter(
		(s) => s.status === 'completed' || new Date(s.scheduledAt) < new Date()
	);

	const handleConfirmSession = async (sessionId: string, confirmed: boolean) => {
		try {
			const response = await fetch('/api/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'confirm',
					sessionId,
					confirmed,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setSessions((prev) =>
					prev.map((s) =>
						s.id === sessionId
							? {
									...s,
									studentConfirmed: userId === s.studentId ? confirmed : s.studentConfirmed,
									tutorConfirmed: userId === s.tutorId ? confirmed : s.tutorConfirmed,
								}
							: s
					)
				);
			}
		} catch (error) {
			console.error('Error confirming session:', error);
		}
	};

	const handleCancelSession = async (sessionId: string, reason?: string) => {
		try {
			const response = await fetch('/api/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'cancel',
					sessionId,
					reason,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setSessions((prev) =>
					prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s))
				);
			}
		} catch (error) {
			console.error('Error cancelling session:', error);
		}
	};

	const handleSubmitReview = async () => {
		setIsSubmittingReview(true);
		try {
			const response = await fetch('/api/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'review',
					sessionId: reviewSessionId,
					rating: reviewRating,
					comment: reviewComment,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setReviewDialogOpen(false);
				setReviewComment('');
				setReviewRating(5);
			} else {
				alert(data.error || 'Failed to submit review');
			}
		} catch (error) {
			console.error('Error submitting review:', error);
		} finally {
			setIsSubmittingReview(false);
		}
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-ZA', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
		});
	};

	const formatTime = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleTimeString('en-ZA', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const renderStars = (rating: number, interactive = false) => {
		return (
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
						onClick={() => interactive && setReviewRating(star)}
						disabled={!interactive}
					>
						<Star
							className={`size-5 ${
								star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted'
							}`}
						/>
					</button>
				))}
			</div>
		);
	};

	const SessionCard = ({ session, isTutor }: { session: TutoringSession; isTutor: boolean }) => {
		const isPast = new Date(session.scheduledAt) < new Date();
		const isCompleted = session.status === 'completed';
		const isCancelled = session.status === 'cancelled';

		const otherPartyName = isTutor ? session.studentName : session.tutorName;
		const otherPartyImage = isTutor ? session.studentImage : session.tutorImage;
		const initials =
			otherPartyName
				?.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase() || (isTutor ? 'S' : 'T');

		return (
			<Card className="p-4 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm">
				<div className="flex items-start gap-3">
					<Avatar className="size-12">
						<AvatarImage src={otherPartyImage || undefined} />
						<AvatarFallback className="bg-primary/10 text-primary font-bold">
							{initials}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-2">
							<h3 className="font-bold text-sm truncate">
								{otherPartyName || (isTutor ? 'Student' : 'Tutor')}
							</h3>
							<Badge
								variant={isCompleted ? 'default' : isCancelled ? 'destructive' : 'secondary'}
								className="text-xs shrink-0"
							>
								{isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Upcoming'}
							</Badge>
						</div>

						<p className="text-sm text-muted-foreground">{session.subject}</p>

						<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
							<span className="flex items-center gap-1">
								<Calendar className="size-3" />
								{formatDate(session.scheduledAt)}
							</span>
							<span className="flex items-center gap-1">
								<Clock className="size-3" />
								{formatTime(session.scheduledAt)}
							</span>
							<span>{session.durationMinutes} min</span>
						</div>

						{isCompleted && (
							<div className="flex items-center gap-2 mt-2 text-xs">
								<span className="text-green-600 font-mono">+{session.xpEarned} XP earned</span>
							</div>
						)}

						{!isPast && !isCancelled && (
							<div className="flex items-center gap-2 mt-3">
								<Dialog
									open={reviewDialogOpen && reviewSessionId === session.id}
									onOpenChange={(open) => {
										setReviewDialogOpen(open);
										setReviewSessionId(session.id);
									}}
								>
									<DialogTrigger asChild>
										<Button size="sm" variant="outline" className="gap-1">
											<Video className="size-3" />
											Join
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Join Video Session</DialogTitle>
										</DialogHeader>
										<div className="mt-4 space-y-4">
											<p className="text-sm text-muted-foreground">
												Video call functionality will be integrated with Daily.co here.
											</p>
											<Button className="w-full gap-2">
												<Video className="size-4" />
												Start Call
											</Button>
										</div>
									</DialogContent>
								</Dialog>

								{!isTutor && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleConfirmSession(session.id, true)}
										disabled={session.studentConfirmed}
										className="gap-1"
									>
										<CheckCircle className="size-3" />
										{session.studentConfirmed ? 'Confirmed' : 'Confirm'}
									</Button>
								)}

								{isTutor && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleConfirmSession(session.id, true)}
										disabled={session.tutorConfirmed}
										className="gap-1"
									>
										<CheckCircle className="size-3" />
										{session.tutorConfirmed ? 'Confirmed' : 'Confirm'}
									</Button>
								)}

								<Button
									size="sm"
									variant="ghost"
									className="text-destructive gap-1"
									onClick={() => handleCancelSession(session.id)}
								>
									<X className="size-3" />
									Cancel
								</Button>
							</div>
						)}

						{isCompleted && session.studentId === userId && (
							<Button
								size="sm"
								variant="outline"
								className="mt-3 gap-1"
								onClick={() => {
									setReviewSessionId(session.id);
									setReviewDialogOpen(true);
								}}
							>
								<Star className="size-3" />
								Leave Review
							</Button>
						)}
					</div>
				</div>
			</Card>
		);
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
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="p-4">
								<div className="flex items-start gap-3">
									<Skeleton className="size-12 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
							</Card>
						))}
					</div>
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
											<SessionCard key={session.id} session={session} isTutor={false} />
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
											<SessionCard key={session.id} session={session} isTutor={true} />
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
										/>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				)}

				<Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Leave a Review</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 mt-4">
							<div>
								<Label>Rating</Label>
								<div className="mt-2">{renderStars(reviewRating, true)}</div>
							</div>
							<div>
								<Label>Comment (optional)</Label>
								<Textarea
									value={reviewComment}
									onChange={(e) => setReviewComment(e.target.value)}
									placeholder="Share your experience..."
									className="mt-2"
								/>
							</div>
							<Button className="w-full" onClick={handleSubmitReview} disabled={isSubmittingReview}>
								{isSubmittingReview ? 'Submitting...' : 'Submit Review'}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}
