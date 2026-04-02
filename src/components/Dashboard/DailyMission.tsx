'use client';

import {
	ArrowRight01Icon,
	BookOpen01Icon,
	Clock01Icon,
	FlashIcon,
	SparklesIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { AdaptiveRecommendation } from '@/actions/adaptive-learning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DailyMission() {
	const router = useRouter();

	const { data, isPending } = useQuery<{ recommendations: AdaptiveRecommendation[] }>({
		queryKey: ['adaptive-recommendations'],
		queryFn: async () => {
			const response = await fetch('/api/adaptive-recommendations?limit=3');
			if (!response.ok) throw new Error('Failed to load missions');
			return response.json();
		},
		staleTime: 60 * 1000,
	});

	const missions = data?.recommendations ?? [];

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'flashcard':
				return BookOpen01Icon;
			case 'quiz':
				return SparklesIcon;
			case 'pastPaper':
				return BookOpen01Icon;
			case 'lesson':
				return Clock01Icon;
			default:
				return Target01Icon;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'flashcard':
				return 'bg-tiimo-blue/15 text-tiimo-blue';
			case 'quiz':
				return 'bg-tiimo-lavender/15 text-tiimo-lavender';
			case 'pastPaper':
				return 'bg-tiimo-green/15 text-tiimo-green';
			case 'lesson':
				return 'bg-tiimo-yellow/15 text-tiimo-yellow';
			default:
				return 'bg-muted text-muted-foreground';
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'flashcard':
				return 'Flashcards';
			case 'quiz':
				return 'Quiz';
			case 'pastPaper':
				return 'Past Paper';
			case 'lesson':
				return 'Lesson';
			default:
				return 'Study';
		}
	};

	const handleMissionClick = (mission: AdaptiveRecommendation) => {
		switch (mission.type) {
			case 'flashcard':
				router.push(`/flashcards?topic=${encodeURIComponent(mission.topic)}`);
				break;
			case 'quiz':
				router.push(
					`/quiz?topic=${encodeURIComponent(mission.topic)}&subject=${encodeURIComponent(mission.subject)}`
				);
				break;
			case 'pastPaper':
				router.push(`/past-papers?subject=${encodeURIComponent(mission.subject)}`);
				break;
			case 'lesson':
				router.push(`/lessons?topic=${encodeURIComponent(mission.topic)}`);
				break;
		}
	};

	if (isPending) {
		return (
			<Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={FlashIcon} className="h-5 w-5 text-primary animate-pulse" />
						Daily Mission
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[1, 2, 3].map((item) => (
							<Skeleton key={`daily-mission-skeleton-${item}`} className="h-16 rounded-xl" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (missions.length === 0) {
		return null;
	}

	return (
		<Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent overflow-hidden">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<m.div
						animate={{ rotate: [0, -10, 10, 0] }}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
					>
						<HugeiconsIcon icon={FlashIcon} className="h-5 w-5 text-primary" />
					</m.div>
					Daily Mission
				</CardTitle>
				<p className="text-xs text-muted-foreground">Your top 3 priority tasks for today</p>
			</CardHeader>
			<CardContent className="space-y-3">
				{missions.slice(0, 3).map((mission, index) => (
					<m.button
						key={`${mission.topic}-${mission.subject}`}
						type="button"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						onClick={() => handleMissionClick(mission)}
						className="w-full p-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl text-left transition-all hover:scale-[1.01] hover:border-primary/30 hover:shadow-md active:scale-[0.99] flex items-center gap-3 group"
					>
						<div
							className={`w-10 h-10 ${getTypeColor(mission.type)} rounded-lg flex items-center justify-center shrink-0`}
						>
							<HugeiconsIcon icon={getTypeIcon(mission.type)} className="w-5 h-5" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="font-bold text-sm text-foreground truncate">{mission.topic}</span>
								<span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground shrink-0">
									{getTypeLabel(mission.type)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground truncate mt-0.5">
								{mission.subject} • {mission.reason}
							</p>
						</div>
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
							<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-primary" />
						</div>
					</m.button>
				))}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push('/review')}
					className="w-full text-xs text-muted-foreground hover:text-foreground"
				>
					View all recommendations
					<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
				</Button>
			</CardContent>
		</Card>
	);
}
