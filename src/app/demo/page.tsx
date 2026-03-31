'use client';

import Link from 'next/link';
import { CallToAction } from '@/components/Demo/CallToAction';
import { Leaderboard } from '@/components/Demo/Leaderboard';
import { PastPapersGrid } from '@/components/Demo/PastPapersGrid';
import { QuestionsList } from '@/components/Demo/QuestionsList';
import { SidebarSection } from '@/components/Demo/SidebarSection';
import { StatCards } from '@/components/Demo/StatCards';
import { SubjectsGrid } from '@/components/Demo/SubjectsGrid';
import { Button } from '@/components/ui/button';
import {
	getLeaderboardWithUsers,
	getQuestionsWithOptions,
	getUpcomingEvents,
	mockAchievements,
	mockNotifications,
	mockPastPapers,
	mockSubjects,
	mockUserAchievements,
} from '@/content/mock';

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
				<StatCards
					subjectsCount={mockSubjects.length}
					questionsCount={questions.length}
					achievementsCount={mockUserAchievements.length}
				/>

				<SubjectsGrid subjects={mockSubjects} />

				<div className="grid md:grid-cols-2 gap-8 mb-8">
					<QuestionsList questions={questions} />
					<Leaderboard leaderboard={leaderboard} />
				</div>

				<SidebarSection
					achievements={mockAchievements}
					userAchievements={mockUserAchievements}
					notifications={mockNotifications}
					events={upcomingEvents}
				/>

				<PastPapersGrid papers={mockPastPapers} />

				<CallToAction />
			</div>
		</div>
	);
}
