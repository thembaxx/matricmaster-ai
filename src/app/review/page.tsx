'use client';

import {
	AiBrain01Icon,
	ArrowRight01Icon,
	BookOpen01Icon,
	Calendar01Icon,
	ChampionIcon,
	Clock01Icon,
	FlashIcon,
	Loading03Icon,
	StarIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { FlashcardModal } from '@/components/AI/FlashcardModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authClient } from '@/lib/auth-client';
import type { DueFlashcard, ReviewStats } from '@/lib/db/review-queue-actions';

interface StudyRecommendation {
	type: 'weak_topic' | 'review' | 'practice' | 'flashcard' | 'new_topic';
	priority: 'high' | 'medium' | 'low';
	topic: string;
	reason: string;
	action: string;
	estimatedTime: string;
}

interface RecommendationsResponse {
	recommendations: StudyRecommendation[];
	summary: string;
	overdueReviews: number;
	totalWeakTopics: number;
}

interface ReviewData {
	dueCards: DueFlashcard[];
	reviewStats: ReviewStats | null;
	recommendations: RecommendationsResponse | null;
}

export default function ReviewPage() {
	const { data: session } = authClient.useSession();
	const [showReviewModal, setShowReviewModal] = useState(false);

	const { data: reviewData, isLoading } = useQuery<ReviewData>({
		queryKey: ['review-data'],
		queryFn: async () => {
			const [dueCardsRes, statsRes, recsRes] = await Promise.all([
				fetch('/api/flashcards/due'),
				fetch('/api/flashcards/stats'),
				fetch('/api/ai-tutor/recommendations', { method: 'POST' }),
			]);

			const dueCards = dueCardsRes.ok ? (await dueCardsRes.json()).cards || [] : [];
			const reviewStats = statsRes.ok ? await statsRes.json() : null;
			const recommendations = recsRes.ok ? await recsRes.json() : null;

			return { dueCards, reviewStats, recommendations };
		},
		enabled: !!session?.user,
	});

	const dueCards = reviewData?.dueCards ?? [];
	const reviewStats = reviewData?.reviewStats ?? null;
	const recommendations = reviewData?.recommendations ?? null;

	const handleRateCard = async (flashcardId: string, rating: 1 | 2 | 3 | 4 | 5) => {
		try {
			const response = await fetch('/api/flashcards/review', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					flashcardId,
					rating,
				}),
			});

			if (response.ok) {
				if (dueCards.length <= 1) {
					setShowReviewModal(false);
					toast.success('Review session complete!');
				}
			} else {
				toast.error('Failed to save review');
			}
		} catch (error) {
			console.debug('Failed to rate card:', error);
			toast.error('Failed to save review');
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'destructive';
			case 'medium':
				return 'secondary';
			case 'low':
				return 'outline';
			default:
				return 'outline';
		}
	};

	const getRecommendationIcon = (type: string) => {
		switch (type) {
			case 'weak_topic':
				return <HugeiconsIcon icon={Target01Icon} className="h-4 w-4" />;
			case 'review':
				return <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />;
			case 'practice':
				return <HugeiconsIcon icon={AiBrain01Icon} className="h-4 w-4" />;
			case 'flashcard':
				return <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />;
			default:
				return <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />;
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<HugeiconsIcon
					icon={Loading03Icon}
					className="h-8 w-8 animate-spin text-muted-foreground"
				/>
			</div>
		);
	}

	const todayAccuracy =
		reviewStats && reviewStats.todayReviews > 0
			? Math.round((reviewStats.correctToday / reviewStats.todayReviews) * 100)
			: 0;

	return (
		<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Review Dashboard</h1>
				<p className="text-muted-foreground">
					Your personalized study recommendations and spaced repetition reviews
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					{dueCards.length > 0 && (
						<Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HugeiconsIcon icon={FlashIcon} className="h-5 w-5 text-primary" />
									Cards Due for Review
								</CardTitle>
								<CardDescription>
									{dueCards.length} card{dueCards.length !== 1 ? 's' : ''} waiting to be reviewed
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button onClick={() => setShowReviewModal(true)} className="w-full sm:w-auto">
									<HugeiconsIcon icon={BookOpen01Icon} className="mr-2 h-4 w-4" />
									Start Review Session
								</Button>
							</CardContent>
						</Card>
					)}

					{recommendations && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HugeiconsIcon icon={Target01Icon} className="h-5 w-5" />
									Personalized Recommendations
								</CardTitle>
								<CardDescription>{recommendations.summary}</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-75 pr-4">
									<div className="space-y-3">
										{recommendations.recommendations.map((rec, index) => (
											<div
												key={index}
												className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
											>
												<div className="mt-0.5 text-muted-foreground">
													{getRecommendationIcon(rec.type)}
												</div>
												<div className="flex-1 space-y-1">
													<div className="flex items-center gap-2">
														<span className="font-medium">{rec.topic}</span>
														<Badge
															variant={
																getPriorityColor(rec.priority) as
																	| 'default'
																	| 'secondary'
																	| 'destructive'
																	| 'outline'
															}
														>
															{rec.priority}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground">{rec.reason}</p>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
														{rec.estimatedTime}
													</div>
												</div>
												<HugeiconsIcon
													icon={ArrowRight01Icon}
													className="h-4 w-4 text-muted-foreground"
												/>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3 sm:grid-cols-2">
								<Button variant="outline" asChild>
									<Link href="/quiz">
										<HugeiconsIcon icon={AiBrain01Icon} className="mr-2 h-4 w-4" />
										Practice Quiz
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link href="/flashcards">
										<HugeiconsIcon icon={BookOpen01Icon} className="mr-2 h-4 w-4" />
										Flashcard Decks
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link href="/ai-tutor">
										<HugeiconsIcon icon={Target01Icon} className="mr-2 h-4 w-4" />
										Study Helper
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link href="/dashboard">
										<HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
										Study Schedule
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<HugeiconsIcon icon={ChampionIcon} className="h-5 w-5 text-yellow-500" />
								Review Statistics
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Today's Accuracy</span>
									<span className="font-medium">{todayAccuracy}%</span>
								</div>
								<Progress value={todayAccuracy} className="h-2" />
							</div>

							<div className="grid grid-cols-2 gap-4 pt-2">
								<div className="text-center">
									<div className="text-2xl font-bold">{reviewStats?.todayReviews || 0}</div>
									<div className="text-xs text-muted-foreground">Today's Reviews</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">{reviewStats?.streakDays || 0}</div>
									<div className="text-xs text-muted-foreground">Day Streak</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">{reviewStats?.totalReviews || 0}</div>
									<div className="text-xs text-muted-foreground">Total Reviews</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">{dueCards.length}</div>
									<div className="text-xs text-muted-foreground">Cards Due</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{recommendations &&
						(recommendations.overdueReviews > 0 || recommendations.totalWeakTopics > 0) && (
							<Card className="border-orange-500/20 bg-orange-500/5">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-orange-600">
										<HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
										Attention Needed
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{recommendations.overdueReviews > 0 && (
										<div className="flex items-center justify-between text-sm">
											<span>Overdue Reviews</span>
											<Badge variant="destructive">{recommendations.overdueReviews}</Badge>
										</div>
									)}
									{recommendations.totalWeakTopics > 0 && (
										<div className="flex items-center justify-between text-sm">
											<span>Weak Topics</span>
											<Badge variant="secondary">{recommendations.totalWeakTopics}</Badge>
										</div>
									)}
								</CardContent>
							</Card>
						)}
				</div>
			</div>

			{showReviewModal && dueCards.length > 0 && (
				<FlashcardModal
					flashcards={dueCards.map((card) => ({
						id: card.id,
						front: card.front,
						back: card.back,
						tags: [],
					}))}
					open={showReviewModal}
					onOpenChange={setShowReviewModal}
					onRate={handleRateCard}
					reviewMode={true}
				/>
			)}
		</div>
	);
}
