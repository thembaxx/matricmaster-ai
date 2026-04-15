'use client';

import {
	ArrowLeft02Icon,
	BookmarkIcon,
	BookOpen01Icon,
	CalculatorIcon,
	ChartAnalysisIcon,
	CheckmarkCircleIcon,
	GridIcon,
	InformationCircleIcon,
	Timer01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mathematics } from '@/content/curriculum/mathematics';

export default function MathematicsPage() {
	const router = useRouter();

	const handleTopicClick = (topicId: string, status: string) => {
		if (status === 'not-started') {
			router.push(`/lessons?topic=${topicId}`);
		} else {
			router.push(`/practice?topic=${topicId}`);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-background pb-40">
			<header className="px-6 pt-12 pb-4 bg-card sticky top-0 z-20 border-b border-border">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/dashboard')}
							className="rounded-full"
						>
							<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
						</Button>
						<div>
							<h1 className="text-2xl font-black flex items-center gap-2">
								<HugeiconsIcon icon={CalculatorIcon} className="w-6 h-6 text-primary" />
								Mathematics
							</h1>
							<p className="text-muted-foreground text-sm">Master the NSC Grade 12 curriculum</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={() => router.push('/math/graph')}>
									<HugeiconsIcon icon={ChartAnalysisIcon} className="w-4 h-4 mr-2" />
									Graphing Tool
								</Button>
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="flex-1 p-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{mathematics.topics.map((topic) => (
						<Card key={topic.id} className="hover:border-primary/50 transition-colors">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center gap-2">
									{topic.status === 'mastered' && (
										<HugeiconsIcon icon={CheckmarkCircleIcon} className="w-5 h-5 text-green-500" />
									)}
									{topic.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{topic.status !== 'not-started' && (
										<div className="space-y-1">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Progress</span>
												<span className="font-medium">{topic.progress}%</span>
											</div>
											<div className="h-2 bg-secondary rounded-full overflow-hidden">
												<div
													className="h-full bg-primary rounded-full transition-all"
													style={{ width: `${topic.progress}%` }}
												/>
											</div>
										</div>
									)}

									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>{topic.questionsAttempted} questions</span>
										<span>{topic.lastPracticed}</span>
									</div>

									<div className="flex gap-2 pt-2">
										<Button
											size="sm"
											variant={topic.status === 'not-started' ? 'default' : 'outline'}
											className="flex-1"
											onClick={() => handleTopicClick(topic.id, topic.status)}
										>
											<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 mr-2" />
											{topic.status === 'not-started' ? 'Start' : 'Practice'}
										</Button>
										<Button size="sm" variant="outline">
											<HugeiconsIcon icon={BookmarkIcon} className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5" />
							Quick Actions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<Button
								variant="outline"
								className="h-auto py-4"
								onClick={() => router.push('/lessons')}
							>
								<div className="flex flex-col items-center gap-2">
									<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5" />
									<span>Topic Lessons</span>
								</div>
							</Button>
							<Button
								variant="outline"
								className="h-auto py-4"
								onClick={() => router.push('/quiz')}
							>
								<div className="flex flex-col items-center gap-2">
									<HugeiconsIcon icon={GridIcon} className="w-5 h-5" />
									<span>Quiz</span>
								</div>
							</Button>
							<Button
								variant="outline"
								className="h-auto py-4"
								onClick={() => router.push('/past-papers')}
							>
								<div className="flex flex-col items-center gap-2">
									<HugeiconsIcon icon={Timer01Icon} className="w-5 h-5" />
									<span>Practice Papers</span>
								</div>
							</Button>
							<Button
								variant="outline"
								className="h-auto py-4"
								onClick={() => router.push('/math/graph')}
							>
								<div className="flex flex-col items-center gap-2">
									<HugeiconsIcon icon={ChartAnalysisIcon} className="w-5 h-5" />
									<span>Graph Tool</span>
								</div>
							</Button>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
