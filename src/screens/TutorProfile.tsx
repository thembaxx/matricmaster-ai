'use client';

import { AlertTriangle, BookOpen, Calendar, Clock, MessageSquare, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface TutorProfile {
	id: string;
	userId: string;
	userName: string | null;
	userImage: string | null;
	bio: string | null;
	teachingStyle: string | null;
	subjects: string[];
	hourlyRateXP: number;
	isAvailable: boolean;
	totalSessions: number;
	rating: number;
	totalRatings: number;
	availabilitySchedule: string | null;
}

interface Review {
	id: string;
	studentName: string | null;
	studentImage: string | null;
	rating: number;
	comment: string | null;
	createdAt: string;
}

export default function TutorProfile({ params }: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const router = useRouter();
	const [tutor, setTutor] = useState<TutorProfile | null>(null);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userXP, setUserXP] = useState(0);
	const [isBooking, setIsBooking] = useState(false);

	const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState('');
	const [selectedDate, setSelectedDate] = useState('');
	const [selectedTime, setSelectedTime] = useState('');
	const [duration, setDuration] = useState('60');

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const [tutorRes, reviewsRes, xpRes] = await Promise.all([
					fetch(`/api/marketplace?action=tutor&tutorId=${resolvedParams.id}`),
					fetch(`/api/marketplace?action=reviews&tutorId=${resolvedParams.id}`),
					fetch('/api/marketplace?action=my-xp'),
				]);

				const tutorData = await tutorRes.json();
				const reviewsData = await reviewsRes.json();
				const xpData = await xpRes.json();

				if (tutorData.success) {
					setTutor(tutorData.data);
					if (tutorData.data.subjects.length > 0) {
						setSelectedSubject(tutorData.data.subjects[0]);
					}
				}

				if (reviewsData.success) {
					setReviews(reviewsData.data);
				}

				if (xpData.success) {
					setUserXP(xpData.data.xp);
				}
			} catch (error) {
				console.error('Error fetching tutor data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [resolvedParams.id]);

	const handleBookSession = async () => {
		if (!selectedDate || !selectedTime || !selectedSubject) return;

		setIsBooking(true);
		try {
			const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
			const response = await fetch('/api/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'book',
					tutorId: resolvedParams.id,
					subject: selectedSubject,
					scheduledAt: scheduledAt.toISOString(),
					durationMinutes: Number.parseInt(duration, 10),
				}),
			});

			const data = await response.json();

			if (data.success) {
				setBookingDialogOpen(false);
				router.push('/my-sessions');
			} else {
				alert(data.error || 'Failed to book session');
			}
		} catch (error) {
			console.error('Error booking session:', error);
			alert('Failed to book session');
		} finally {
			setIsBooking(false);
		}
	};

	const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		const starSize = size === 'sm' ? 'size-3' : 'size-4';

		return (
			<div className="flex items-center gap-0.5">
				{[...Array(fullStars)].map((_, i) => (
					<Star key={`full-${i}`} className={`${starSize} fill-amber-400 text-amber-400`} />
				))}
				{hasHalfStar && (
					<div className={`relative ${starSize}`}>
						<Star className={`absolute ${starSize} text-muted`} />
						<div className="absolute overflow-hidden w-1/2">
							<Star className={`${starSize} fill-amber-400 text-amber-400`} />
						</div>
					</div>
				)}
				{[...Array(emptyStars)].map((_, i) => (
					<Star key={`empty-${i}`} className={`${starSize} text-muted`} />
				))}
			</div>
		);
	};

	const xpCost = tutor ? Math.ceil((tutor.hourlyRateXP * Number.parseInt(duration, 10)) / 60) : 0;
	const canAfford = userXP >= xpCost;

	if (isLoading) {
		return (
			<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
				<BackgroundMesh variant="subtle" />
				<main className="max-w-4xl mx-auto w-full pt-6 space-y-6 relative z-10">
					<div className="flex items-start gap-4">
						<Skeleton className="size-20 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (!tutor) {
		return (
			<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
				<BackgroundMesh variant="subtle" />
				<main className="max-w-4xl mx-auto w-full pt-6 text-center relative z-10">
					<AlertTriangle className="size-12 mx-auto text-muted-foreground mb-4" />
					<h2 className="text-xl font-bold">Tutor not found</h2>
					<Button className="mt-4" onClick={() => router.push('/marketplace')}>
						Back to Marketplace
					</Button>
				</main>
			</div>
		);
	}

	const initials =
		tutor.userName
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase() || 'T';

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-4xl mx-auto w-full pt-6 space-y-6 relative z-10">
				<Button variant="ghost" className="gap-2" onClick={() => router.back()}>
					← Back
				</Button>

				<Card className="p-6 rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm">
					<div className="flex flex-col sm:flex-row gap-6">
						<Avatar className="size-20 border-2 border-border mx-auto sm:mx-0">
							<AvatarImage src={tutor.userImage || undefined} alt={tutor.userName || 'Tutor'} />
							<AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
								{initials}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 text-center sm:text-left">
							<h1 className="text-2xl font-black">{tutor.userName || 'Anonymous Tutor'}</h1>

							<div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
								{renderStars(tutor.rating, 'md')}
								<span className="text-sm text-muted-foreground font-mono">
									{tutor.rating.toFixed(1)} ({tutor.totalRatings} reviews)
								</span>
							</div>

							<div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-muted-foreground font-mono">
								<Clock className="size-4" />
								{tutor.totalSessions} sessions completed
							</div>

							<div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
								{tutor.subjects.map((subject) => (
									<Badge key={subject} variant="secondary" className="font-normal">
										<BookOpen className="size-3 mr-1" />
										{subject}
									</Badge>
								))}
							</div>

							<div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
								<Badge variant="outline" className="font-mono text-base px-3 py-1">
									{tutor.hourlyRateXP} XP / hour
								</Badge>
								{tutor.isAvailable ? (
									<Badge className="bg-green-500/10 text-green-600">Available</Badge>
								) : (
									<Badge variant="destructive">Unavailable</Badge>
								)}
							</div>
						</div>
					</div>

					{tutor.bio && (
						<div className="mt-6 pt-6 border-t">
							<h3 className="font-bold mb-2">About</h3>
							<p className="text-sm text-muted-foreground">{tutor.bio}</p>
						</div>
					)}

					{tutor.teachingStyle && (
						<div className="mt-6 pt-6 border-t">
							<h3 className="font-bold mb-2">Teaching Style</h3>
							<p className="text-sm text-muted-foreground">{tutor.teachingStyle}</p>
						</div>
					)}

					{tutor.availabilitySchedule && (
						<div className="mt-6 pt-6 border-t">
							<h3 className="font-bold mb-2 flex items-center gap-2">
								<Calendar className="size-4" />
								Availability
							</h3>
							<p className="text-sm text-muted-foreground whitespace-pre-line">
								{tutor.availabilitySchedule}
							</p>
						</div>
					)}

					<div className="mt-6 pt-6 border-t">
						<Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
							<DialogTrigger asChild>
								<Button className="w-full gap-2" size="lg" disabled={!tutor.isAvailable}>
									<Calendar className="size-4" />
									Book Session
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Book a Session</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 mt-4">
									<div>
										<Label>Subject</Label>
										<Select value={selectedSubject} onValueChange={setSelectedSubject}>
											<SelectTrigger>
												<SelectValue placeholder="Select subject" />
											</SelectTrigger>
											<SelectContent>
												{tutor.subjects.map((subject) => (
													<SelectItem key={subject} value={subject}>
														{subject}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Duration</Label>
										<Select value={duration} onValueChange={setDuration}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="30">30 minutes</SelectItem>
												<SelectItem value="60">1 hour</SelectItem>
												<SelectItem value="90">1.5 hours</SelectItem>
												<SelectItem value="120">2 hours</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label>Date</Label>
											<Input
												type="date"
												value={selectedDate}
												onChange={(e) => setSelectedDate(e.target.value)}
												min={new Date().toISOString().split('T')[0]}
											/>
										</div>
										<div>
											<Label>Time</Label>
											<Input
												type="time"
												value={selectedTime}
												onChange={(e) => setSelectedTime(e.target.value)}
											/>
										</div>
									</div>

									<div className="p-4 bg-muted rounded-xl">
										<div className="flex justify-between text-sm">
											<span>Session cost:</span>
											<span className="font-mono font-bold">{xpCost} XP</span>
										</div>
										<div className="flex justify-between text-sm mt-1">
											<span>Your balance:</span>
											<span className="font-mono font-bold">{userXP} XP</span>
										</div>
										{!canAfford && (
											<p className="text-xs text-destructive mt-2">
												Insufficient XP. You need {xpCost - userXP} more XP.
											</p>
										)}
									</div>

									<Button
										className="w-full"
										onClick={handleBookSession}
										disabled={
											!selectedDate || !selectedTime || !selectedSubject || isBooking || !canAfford
										}
									>
										{isBooking ? 'Booking...' : `Book for ${xpCost} XP`}
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</Card>

				<Card className="p-6 rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm">
					<h2 className="text-lg font-bold flex items-center gap-2">
						<MessageSquare className="size-5" />
						Reviews ({reviews.length})
					</h2>

					{reviews.length === 0 ? (
						<p className="text-sm text-muted-foreground mt-4">No reviews yet.</p>
					) : (
						<div className="mt-4 space-y-4">
							{reviews.map((review) => (
								<div key={review.id} className="pb-4 border-b last:border-0">
									<div className="flex items-center gap-2">
										<Avatar className="size-8">
											<AvatarImage src={review.studentImage || undefined} />
											<AvatarFallback className="text-xs">
												{review.studentName?.[0] || 'S'}
											</AvatarFallback>
										</Avatar>
										<div>
											<span className="font-medium text-sm">{review.studentName || 'Student'}</span>
											<div className="flex items-center gap-1">{renderStars(review.rating)}</div>
										</div>
									</div>
									{review.comment && (
										<p className="text-sm text-muted-foreground mt-2 ml-10">{review.comment}</p>
									)}
								</div>
							))}
						</div>
					)}
				</Card>
			</main>
		</div>
	);
}
