'use client';

import {
	AtomIcon,
	BookOpenIcon,
	CalculatorIcon,
	Calendar02Icon,
	Globe02Icon,
	Medal01Icon,
	MicroscopeIcon,
	StarIcon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { SafeImage } from '@/components/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSection } from '@/components/ui/data-loader';
import {
	getLeaderboardWithUsers,
	getQuestionsWithOptions,
	getUpcomingEvents,
	mockAchievements,
	mockNotifications,
	mockPastPapers,
	mockSubjects,
	mockUserAchievements,
} from '@/data';
import { cn } from '@/lib/utils';

type IconSvg = typeof CalculatorIcon;

const subjectIcons: Record<string, IconSvg> = {
	Mathematics: CalculatorIcon,
	'Physical Sciences': AtomIcon,
	'Life Sciences': MicroscopeIcon,
	Geography: Globe02Icon,
	History: BookOpenIcon,
	Accounting: Medal01Icon,
	Economics: Medal01Icon,
};

export default function DemoPage() {
	const questions = getQuestionsWithOptions();
	const leaderboard = getLeaderboardWithUsers();
	const upcomingEvents = getUpcomingEvents();

	return (
		<div className="min-h-screen bg-background">
			<div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
								MatricMaster Demo
							</h1>
							<p className="text-sm text-muted-foreground">Explore our NSC Grade 12 mock data</p>
						</div>
						<Link href="/dashboard">
							<Button variant="outline" size="sm">
								Go to Dashboard
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
									<HugeiconsIcon icon={BookOpenIcon} className="w-6 h-6 text-primary" />
								</div>
								<div>
									<p className="text-3xl font-bold">{mockSubjects.length}</p>
									<p className="text-sm text-muted-foreground">Subjects</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
									<HugeiconsIcon icon={Medal01Icon} className="w-6 h-6 text-blue-500" />
								</div>
								<div>
									<p className="text-3xl font-bold">{questions.length}</p>
									<p className="text-sm text-muted-foreground">Questions</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
									<HugeiconsIcon icon={Medal01Icon} className="w-6 h-6 text-green-500" />
								</div>
								<div>
									<p className="text-3xl font-bold">{mockUserAchievements.length}</p>
									<p className="text-sm text-muted-foreground">Achievements</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
									<HugeiconsIcon icon={UserGroupIcon} className="w-6 h-6 text-purple-500" />
								</div>
								<div>
									<p className="text-3xl font-bold">3</p>
									<p className="text-sm text-muted-foreground">Study Buddies</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<DataSection
					title="Subjects"
					description="Available NSC subjects for Grade 12"
					className="mb-8"
				>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{mockSubjects.map((subject) => {
							const IconComponent = subjectIcons[subject.name] || BookOpenIcon;
							return (
								<Card
									key={subject.id}
									className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
								>
									<CardContent className="pt-6">
										<div className="flex flex-col items-center text-center gap-3">
											<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
												<HugeiconsIcon icon={IconComponent} className="w-7 h-7 text-primary" />
											</div>
											<div>
												<h3 className="font-semibold">{subject.name}</h3>
												<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
													{subject.description}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</DataSection>

				<div className="grid md:grid-cols-2 gap-8 mb-8">
					<DataSection
						title="Sample Questions"
						description="Example quiz questions from our database"
					>
						<div className="space-y-4">
							{questions.slice(0, 5).map((question) => (
								<Card key={question.id} className="hover:shadow-md transition-shadow">
									<CardContent className="pt-4">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<Badge variant="outline" className="text-xs">
														{question.topic}
													</Badge>
													<Badge
														variant="secondary"
														className={cn(
															'text-xs',
															question.difficulty === 'easy' && 'bg-green-500/10 text-green-600',
															question.difficulty === 'medium' &&
																'bg-yellow-500/10 text-yellow-600',
															question.difficulty === 'hard' && 'bg-red-500/10 text-red-600'
														)}
													>
														{question.difficulty}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{question.marks} marks
													</span>
												</div>
												<p className="text-sm">{question.questionText}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</DataSection>

					<DataSection title="Weekly Leaderboard" description="Top learners this week">
						<div className="space-y-3">
							{leaderboard.map((user, index) => (
								<Card
									key={user.id}
									className={cn(
										'transition-all',
										index < 3 &&
											'bg-gradient-to-r from-yellow-500/5 to-transparent border-yellow-500/20'
									)}
								>
									<CardContent className="pt-4">
										<div className="flex items-center gap-4">
											<div
												className={cn(
													'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
													user.rank === 1 && 'bg-yellow-500 text-white',
													user.rank === 2 && 'bg-gray-400 text-white',
													user.rank === 3 && 'bg-orange-400 text-white',
													user.rank > 3 && 'bg-muted text-muted-foreground'
												)}
											>
												{user.rank}
											</div>
											<div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden">
												<SafeImage
													src={user.avatar}
													alt={user.name}
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="flex-1">
												<p className="font-medium">{user.name}</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-primary">{user.points}</p>
												<p className="text-xs text-muted-foreground">points</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</DataSection>
				</div>

				<div className="grid md:grid-cols-3 gap-8 mb-8">
					<DataSection title="Achievements" description="Your unlocked achievements">
						<div className="grid grid-cols-2 gap-3">
							{mockAchievements.map((achievement) => {
								const isUnlocked = mockUserAchievements.some(
									(ua) => ua.achievementId === achievement.achievementId
								);
								return (
									<Card
										key={achievement.id}
										className={cn('transition-all', !isUnlocked && 'opacity-50 grayscale')}
									>
										<CardContent className="pt-4">
											<div className="flex flex-col items-center text-center gap-2">
												<HugeiconsIcon
													icon={StarIcon}
													className={cn('w-8 h-8', isUnlocked ? 'text-yellow-500' : 'text-muted')}
												/>
												<p className="font-medium text-sm">{achievement.title}</p>
												<p className="text-xs text-muted-foreground">{achievement.description}</p>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</DataSection>

					<DataSection title="Recent Notifications" description="Your latest updates">
						<div className="space-y-3">
							{mockNotifications.slice(0, 4).map((notification) => (
								<Card
									key={notification.id}
									className={cn(!notification.isRead && 'border-primary/30')}
								>
									<CardContent className="pt-4">
										<div className="flex items-start gap-3">
											<Badge variant="secondary" className="text-xs">
												{notification.type.replace('_', ' ')}
											</Badge>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm truncate">{notification.title}</p>
												<p className="text-xs text-muted-foreground line-clamp-2">
													{notification.message}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</DataSection>

					<DataSection title="Upcoming Events" description="Your scheduled activities">
						<div className="space-y-3">
							{upcomingEvents.slice(0, 4).map((event) => (
								<Card key={event.id}>
									<CardContent className="pt-4">
										<div className="flex items-start gap-3">
											<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
												<HugeiconsIcon icon={Calendar02Icon} className="w-5 h-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm truncate">{event.title}</p>
												<p className="text-xs text-muted-foreground">
													{new Date(event.startTime).toLocaleDateString('en-ZA', {
														weekday: 'short',
														month: 'short',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</DataSection>
				</div>

				<DataSection title="Past Papers" description="NSC exam papers by subject">
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
						{mockPastPapers.slice(0, 6).map((paper) => (
							<Card
								key={paper.paperId}
								className="hover:shadow-lg transition-all duration-200 hover:border-primary/30"
							>
								<CardHeader className="pb-2">
									<CardTitle className="text-base">{paper.subject}</CardTitle>
									<CardDescription>
										{paper.paper} - {paper.month} {paper.year}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<Badge variant="outline">{paper.totalMarks} marks</Badge>
										<Button size="sm" variant="ghost">
											View Paper
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</DataSection>

				<div className="mt-12 p-8 bg-muted/30 rounded-2xl text-center">
					<h2 className="text-2xl font-bold mb-2">Ready to Start Learning?</h2>
					<p className="text-muted-foreground mb-6 max-w-md mx-auto">
						This demo showcases our comprehensive NSC Grade 12 curriculum data. Sign up to access
						quizzes, flashcards, past papers, and more.
					</p>
					<div className="flex gap-4 justify-center">
						<Link href="/sign-up">
							<Button size="lg">Get Started Free</Button>
						</Link>
						<Link href="/dashboard">
							<Button size="lg" variant="outline">
								Go to Dashboard
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
