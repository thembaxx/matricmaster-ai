'use client';

import { RefreshCwIcon, SparklesIcon } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import {
	AccuracyTrend,
	ActivityHeatmap,
	ActivityStream,
	ActivityStreamSkeleton,
	CohortComparison,
	ProgressRings,
	StreakCounter,
	WeakTopicHighlights,
} from '@/components/EnrichedDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useEnrichmentStore } from '@/stores/enrichment-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimelineResponse {
	userId: string;
	heatmap: { date: string; count: number }[];
	streak: { current: number; best: number };
	subjects: { subject: string; count: number; averageAccuracy: number }[];
	accuracyTrends: { date: string; accuracy: number; cumulativeAccuracy: number }[];
	weakTopics: {
		topic: string;
		masteryLevel: number;
		questionsAttempted: number;
		accuracy: number;
	}[];
	cohortComparison: { userAccuracy: number; cohortAverage: number; percentile: number };
	recentActivity: {
		id: string;
		type: string;
		date: string;
		subject: string;
		topic: string;
		score: number;
		totalQuestions: number;
		percentage: number;
		durationMinutes: number;
		cardsReviewed: number;
		averageRating: number;
		questionsAttempted: number;
		correctAnswers: number;
	}[];
}

type ActivityType = 'quiz' | 'flashcard' | 'study' | 'achievement';

interface ActivityItem {
	type: ActivityType;
	title: string;
	detail: string;
	timestamp: Date;
	icon: string;
}

// ---------------------------------------------------------------------------
// Sample / fallback data
// ---------------------------------------------------------------------------

const SUBJECT_COLORS: Record<string, string> = {
	mathematics: '#3B82F6',
	physics: '#8B5CF6',
	chemistry: '#EC4899',
	biology: '#10B981',
	'english home language': '#F59E0B',
	geography: '#06B6D4',
	history: '#EF4444',
	'life orientation': '#14B8A6',
};

function mapActivityType(raw: string): ActivityType {
	const lower = raw.toLowerCase();
	if (lower.includes('quiz')) return 'quiz';
	if (lower.includes('flashcard')) return 'flashcard';
	if (lower.includes('achievement') || lower.includes('badge')) return 'achievement';
	return 'study';
}

function transformResponse(data: TimelineResponse) {
	const subjectProgress = data.subjects.map((s) => ({
		name: s.subject,
		color: SUBJECT_COLORS[s.subject.toLowerCase()] ?? '#3B82F6',
		progress: Math.round(s.averageAccuracy),
		attempted: s.count,
		target: Math.max(s.count + 5, 20),
	}));

	const activities: ActivityItem[] = data.recentActivity.map((a) => ({
		type: mapActivityType(a.type),
		title: `${a.subject}${a.topic ? ` - ${a.topic}` : ''}`,
		detail: `${a.percentage.toFixed(0)}% accuracy · ${a.durationMinutes}min`,
		timestamp: new Date(a.date),
		icon: a.type,
	}));

	const weakTopics = data.weakTopics.map((t) => ({
		name: t.topic,
		accuracy: Math.round(t.accuracy),
		attempted: t.questionsAttempted,
		suggestedAction: `Review ${t.topic} concepts and try practice questions`,
	}));

	return {
		heatmap: data.heatmap,
		totalDays: data.heatmap.length,
		streak: data.streak,
		subjectProgress,
		accuracyTrend: data.accuracyTrends.map((t) => ({
			date: t.date,
			accuracy: t.cumulativeAccuracy,
		})),
		weakTopics,
		cohortComparison: data.cohortComparison,
		activities,
	};
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="h-4 w-32 mb-4" />
							<Skeleton className="h-20 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
			<Card>
				<CardContent className="p-6">
					<Skeleton className="h-32 w-full" />
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<Card className="lg:col-span-2">
					<CardContent className="p-6">
						<Skeleton className="h-40 w-full" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<Skeleton className="h-40 w-full" />
					</CardContent>
				</Card>
			</div>
			<ActivityStreamSkeleton />
		</div>
	);
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
	return (
		<Card>
			<CardContent className="py-16 text-center">
				<m.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
						<SparklesIcon className="w-8 h-8 text-primary" />
					</div>
					<h3 className="text-lg font-bold mb-2">No study data yet</h3>
					<p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
						Start studying to see your personalised dashboard, or generate demo data to explore the
						features.
					</p>
					<Button onClick={onGenerate} className="gap-2">
						<SparklesIcon className="w-4 h-4" />
						Generate Demo Data
					</Button>
				</m.div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

const DEMO_USER_ID = 'demo-user-001';

export default function EnrichedDashboardPage() {
	const [data, setData] = useState<ReturnType<typeof transformResponse> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const mockDataEnabled = useEnrichmentStore((s) => s.mockDataEnabled);
	const setMockDataEnabled = useEnrichmentStore((s) => s.setMockDataEnabled);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/activity/${DEMO_USER_ID}/timeline`, {
				cache: 'no-store',
			});
			if (!res.ok) {
				throw new Error(`API returned ${res.status}`);
			}
			const json: TimelineResponse = await res.json();
			setData(transformResponse(json));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleGenerateDemoData = useCallback(() => {
		if (!mockDataEnabled) {
			setMockDataEnabled(true);
		}
		fetchData();
	}, [mockDataEnabled, setMockDataEnabled, fetchData]);

	const handleToggleMock = useCallback(
		(checked: boolean) => {
			setMockDataEnabled(checked);
			if (checked) {
				fetchData();
			}
		},
		[setMockDataEnabled, fetchData]
	);

	const now = new Date();
	const lastUpdated = now.toLocaleTimeString('en-ZA', {
		hour: 'numeric',
		minute: '2-digit',
	});

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: { staggerChildren: 0.08, delayChildren: 0.1 },
		},
	};

	const item = {
		hidden: { opacity: 0, y: 16 },
		show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
	};

	return (
		<div className="min-h-screen bg-background pb-40">
			{/* Header */}
			<div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1
								className="text-2xl font-bold"
								style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
							>
								Your Study Dashboard
							</h1>
							<p className="text-sm text-muted-foreground mt-0.5 font-numeric">
								Last updated at {lastUpdated}
							</p>
						</div>
						<div className="flex items-center gap-3 shrink-0">
							<div className="flex items-center gap-2">
								<Switch checked={mockDataEnabled} onCheckedChange={handleToggleMock} />
								<span className="text-xs text-muted-foreground">Demo</span>
							</div>
							<Badge variant="outline" className="font-numeric gap-1.5">
								<span
									className={
										mockDataEnabled
											? 'w-1.5 h-1.5 rounded-full bg-tiimo-green'
											: 'w-1.5 h-1.5 rounded-full bg-muted-foreground'
									}
								/>
								{mockDataEnabled ? 'Mock data' : 'Live'}
							</Badge>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 py-6">
				{loading ? (
					<DashboardSkeleton />
				) : error && !data ? (
					<EmptyState onGenerate={handleGenerateDemoData} />
				) : data === null ? (
					<EmptyState onGenerate={handleGenerateDemoData} />
				) : (
					<m.div variants={container} initial="hidden" animate="show" className="space-y-6">
						{/* Top row: Streak, Progress Rings, Cohort */}
						<m.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<StreakCounter
								currentStreak={data.streak.current}
								bestStreak={data.streak.best}
								lastStudiedAt={new Date()}
							/>
							<ProgressRings subjects={data.subjectProgress} />
							<CohortComparison
								userAccuracy={data.cohortComparison.userAccuracy}
								cohortAverage={data.cohortComparison.cohortAverage}
								percentile={data.cohortComparison.percentile}
							/>
						</m.div>

						{/* Activity Heatmap - full width */}
						<m.div variants={item}>
							<ActivityHeatmap timeline={data.heatmap} totalDays={data.totalDays} />
						</m.div>

						{/* Accuracy Trend (2/3) + Weak Topics (1/3) */}
						<m.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
							<div className="lg:col-span-2">
								{data.accuracyTrend.length > 0 ? (
									<AccuracyTrend data={data.accuracyTrend} subject="Overall" color="#3B82F6" />
								) : (
									<Card>
										<CardContent className="py-12 text-center text-sm text-muted-foreground">
											No accuracy data yet. Complete some quizzes to see your trend.
										</CardContent>
									</Card>
								)}
							</div>
							<div>
								<WeakTopicHighlights topics={data.weakTopics} />
							</div>
						</m.div>

						{/* Activity Stream - full width */}
						<m.div variants={item}>
							<ActivityStream activities={data.activities} />
						</m.div>

						{/* Refresh button */}
						<m.div variants={item} className="flex justify-center pt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={fetchData}
								disabled={loading}
								className="gap-2"
							>
								<RefreshCwIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
								Refresh Data
							</Button>
						</m.div>
					</m.div>
				)}
			</div>
		</div>
	);
}
