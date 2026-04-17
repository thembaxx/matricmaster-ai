'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { UnifiedStats } from '@/actions/get-unified-user-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProgressHubProps {
	stats: UnifiedStats;
	session: { user: { name?: string | null } | null };
}

export function ProgressHub({ stats, session }: ProgressHubProps) {
	const router = useRouter();
	const userName = session?.user?.name ?? 'Learner';

	const handleContinueLearning = () => {
		router.push('/quiz');
	};

	const handleReviewWeak = () => {
		router.push('/study-plan');
	};

	const handleReviewFlashcards = () => {
		router.push('/flashcards');
	};

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pb-40"
		>
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				<div className="mb-8">
					<h1
						className="text-4xl md:text-5xl font-bold mb-2"
						style={{ fontFamily: 'Playfair Display, serif' }}
					>
						My Progress Hub
					</h1>
					<p className="text-muted-foreground text-lg">
						Welcome back, {userName}. Here is your complete learning overview.
					</p>
				</div>

				<Tabs defaultValue="overview" className="space-y-6">
					<TabsList className="bg-background/80 backdrop-blur-sm border">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="subjects">Subjects</TabsTrigger>
						<TabsTrigger value="flashcards">Flashcards</TabsTrigger>
						<TabsTrigger value="achievements">Achievements</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-6">
						<ProgressHubStats stats={stats} />
						<ProgressHubQuickActions
							onContinueLearning={handleContinueLearning}
							onReviewWeak={handleReviewWeak}
							onReviewFlashcards={handleReviewFlashcards}
						/>
					</TabsContent>

					<TabsContent value="subjects" className="space-y-6">
						<ProgressHubSubjectMastery stats={stats} />
					</TabsContent>

					<TabsContent value="flashcards" className="space-y-6">
						<ProgressHubFlashcardDigest stats={stats} />
					</TabsContent>

					<TabsContent value="achievements" className="space-y-6">
						<ProgressHubAchievements stats={stats} />
					</TabsContent>
				</Tabs>
			</div>
		</m.div>
	);
}

function ProgressHubStats({ stats }: { stats: UnifiedStats }) {
	const getReadinessColor = (score: number) => {
		if (score >= 70) return 'text-green-500';
		if (score >= 40) return 'text-yellow-500';
		return 'text-orange-500';
	};

	const getReadinessBg = (score: number) => {
		if (score >= 70) return 'bg-green-500/10';
		if (score >= 40) return 'bg-yellow-500/10';
		return 'bg-orange-500/10';
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
				<CardHeader className="pb-2">
					<CardDescription className="text-xs uppercase tracking-wider">
						Readiness Score
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className={`text-4xl font-bold ${getReadinessColor(stats.readinessScore)}`}>
						{stats.readinessScore}
					</div>
					<Progress
						value={stats.readinessScore}
						className={`mt-2 h-2 ${getReadinessBg(stats.readinessScore)}`}
					/>
					<p className="text-xs text-muted-foreground mt-2">Based on streak, accuracy & reviews</p>
				</CardContent>
			</Card>

			<Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
				<CardHeader className="pb-2">
					<CardDescription className="text-xs uppercase tracking-wider">
						Current Streak
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-4xl font-bold text-orange-500">{stats.streak.currentStreak}</div>
					<p className="text-xs text-muted-foreground mt-2">
						Best: {stats.streak.bestStreak} days • {stats.streak.multiplierLabel} (
						{stats.streak.multiplier}x)
					</p>
				</CardContent>
			</Card>

			<Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
				<CardHeader className="pb-2">
					<CardDescription className="text-xs uppercase tracking-wider">XP & Level</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-4xl font-bold text-purple-500">Level {stats.level.level}</div>
					<p className="text-xs text-muted-foreground mt-2">
						{stats.level.title} • {stats.progress.totalMarksEarned} XP
					</p>
					<Progress value={stats.level.progressPercent} className="mt-2 h-2 bg-purple-500/20" />
				</CardContent>
			</Card>

			<Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
				<CardHeader className="pb-2">
					<CardDescription className="text-xs uppercase tracking-wider">Accuracy</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-4xl font-bold text-blue-500">{stats.progress.accuracy}%</div>
					<p className="text-xs text-muted-foreground mt-2">
						{stats.progress.totalCorrect}/{stats.progress.totalQuestionsAttempted} correct
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

function ProgressHubQuickActions({
	onContinueLearning,
	onReviewWeak,
	onReviewFlashcards,
}: {
	onContinueLearning: () => void;
	onReviewWeak: () => void;
	onReviewFlashcards: () => void;
}) {
	return (
		<Card className="bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm border-2 border-accent/30">
			<CardHeader>
				<CardTitle className="text-xl">Quick Actions</CardTitle>
				<CardDescription>Jump back into learning</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-3">
					<Button
						onClick={onContinueLearning}
						className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
					>
						Continue Learning
					</Button>
					<Button variant="outline" onClick={onReviewWeak}>
						Review Weak Topics
					</Button>
					<Button variant="outline" onClick={onReviewFlashcards}>
						Review Flashcards
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function ProgressHubSubjectMastery({ stats }: { stats: UnifiedStats }) {
	return (
		<Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
			<CardHeader>
				<CardTitle className="text-xl">Subject Mastery</CardTitle>
				<CardDescription>Your progress across subjects</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{stats.subjectMastery.map((subject) => (
						<div key={subject.slug} className="p-4 rounded-lg bg-background/50 border">
							<div className="flex justify-between items-center mb-2">
								<span className="font-medium">{subject.subject}</span>
								<span className="text-sm text-muted-foreground">
									{Math.round(subject.masteryPercent)}%
								</span>
							</div>
							<Progress value={subject.masteryPercent} className="h-2" />
						</div>
					))}
				</div>

				{stats.weakTopics.length > 0 && (
					<div className="mt-6">
						<h4 className="font-medium mb-3 text-orange-500">Topics to Focus On</h4>
						<div className="flex flex-wrap gap-2">
							{stats.weakTopics.slice(0, 5).map((topic, index) => (
								<span
									key={index}
									className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-sm border border-orange-500/30"
								>
									{topic.topic}
								</span>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function ProgressHubFlashcardDigest({ stats }: { stats: UnifiedStats }) {
	return (
		<Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
			<CardHeader>
				<CardTitle className="text-xl">Flashcard Digest</CardTitle>
				<CardDescription>Your spaced repetition progress</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-4 rounded-lg bg-background/50 border">
						<div className="text-3xl font-bold text-red-500">{stats.flashcards.dueToday}</div>
						<div className="text-xs text-muted-foreground">Due Today</div>
					</div>
					<div className="text-center p-4 rounded-lg bg-background/50 border">
						<div className="text-3xl font-bold text-green-500">
							{stats.flashcards.memorizationRate}%
						</div>
						<div className="text-xs text-muted-foreground">Memorization Rate</div>
					</div>
					<div className="text-center p-4 rounded-lg bg-background/50 border">
						<div className="text-3xl font-bold text-blue-500">{stats.flashcards.masteredCards}</div>
						<div className="text-xs text-muted-foreground">Mastered</div>
					</div>
					<div className="text-center p-4 rounded-lg bg-background/50 border">
						<div className="text-3xl font-bold text-yellow-500">
							{stats.flashcards.learningCards}
						</div>
						<div className="text-xs text-muted-foreground">Learning</div>
					</div>
				</div>

				<div className="mt-4 text-sm text-muted-foreground">
					Total reviews: {stats.flashcards.totalReviews} • Streak: {stats.flashcards.streakDays}{' '}
					days
				</div>
			</CardContent>
		</Card>
	);
}

function ProgressHubAchievements({ stats }: { stats: UnifiedStats }) {
	const progressPercent =
		stats.achievements.total > 0
			? Math.round((stats.achievements.unlocked / stats.achievements.total) * 100)
			: 0;

	return (
		<Card className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
			<CardHeader>
				<CardTitle className="text-xl">Achievements</CardTitle>
				<CardDescription>Your unlocked achievements</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="text-center p-6 rounded-lg bg-background/50 border">
					<div className="text-4xl font-bold text-yellow-500 mb-2">
						{stats.achievements.unlocked}
					</div>
					<div className="text-muted-foreground mb-4">
						of {stats.achievements.total} achievements unlocked
					</div>
					<Progress value={progressPercent} className="h-2" />
					<p className="text-xs text-muted-foreground mt-2">{progressPercent}% complete</p>
				</div>

				<div className="mt-4">
					<p className="text-sm text-muted-foreground">
						{stats.tutoring.hasProfile
							? 'You have an active study buddy profile.'
							: 'Enable study buddy to learn with peers.'}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
