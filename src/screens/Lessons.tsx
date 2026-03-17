'use client';

import {
	ArrowDown01Icon,
	Chemistry01Icon,
	Clock01Icon,
	FireIcon,
	GlobeIcon,
	LayoutLeftIcon,
	LockIcon,
	Medal01Icon,
	Tick01Icon,
	TranslateIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { TTSButton } from '@/components/Lessons/TTSButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import chemistryData from '@/constants/lessons/chemistry.json';
import lifeSciencesData from '@/constants/lessons/life-sciences.json';
import mathematicsData from '@/constants/lessons/mathematics.json';
import physicsData from '@/constants/lessons/physics.json';
import { getSubjectEmoji, type SUBJECTS } from '@/constants/subjects';

interface Lesson {
	id: string;
	subject: string;
	topic: string;
	title: string;
	content: string;
	duration: number;
	difficulty: string;
	prerequisites: string[];
	learning_objectives: string[];
	progress?: number;
	status?: 'completed' | 'active' | 'locked';
	icon?: string;
	color?: string;
	iconColor?: string;
	isContinue?: boolean;
	time?: string;
}

export default function Lessons() {
	const [lessonsData, setLessonsData] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState('all');

	useEffect(() => {
		const getIconForSubject = (subject: string): string => {
			const subjectKey = subject.toLowerCase().replace(' ', '-') as keyof typeof SUBJECTS;
			return getSubjectEmoji(subjectKey) ?? '📚';
		};

		const getColorForSubject = (subject: string): string => {
			const subjectKey = subject.toLowerCase().replace(' ', '-') as keyof typeof SUBJECTS;
			switch (subjectKey) {
				case 'mathematics':
					return 'bg-brand-amber/10';
				case 'physics':
					return 'bg-primary/10';
				case 'life-sciences':
					return 'bg-brand-green/10';
				case 'english':
					return 'bg-brand-red/10';
				default:
					return 'bg-muted/10';
			}
		};

		const getIconColorForSubject = (subject: string): string => {
			switch (subject.toLowerCase()) {
				case 'mathematics':
					return 'text-brand-amber';
				case 'physical sciences':
					return 'text-primary';
				case 'life sciences':
					return 'text-brand-green';
				case 'english':
					return 'text-brand-red';
				default:
					return 'text-muted-foreground';
			}
		};

		// Load lesson data from JSON files
		const loadLessons = async () => {
			try {
				// Convert JSON objects to flat arrays of lessons
				const mathArray = mathematicsData.mathematics || [];
				const mechanicsArray = physicsData.mechanics || [];
				const wavesArray = physicsData.waves || [];
				const electricityArray = physicsData.electricity || [];
				const chemistryArray = chemistryData.chemistry || [];
				const lifeArray = lifeSciencesData.life_sciences || [];

				const getRandomStatus = (): 'completed' | 'active' | 'locked' => {
					const rand = Math.random();
					return (rand > 0.7 ? 'completed' : rand > 0.3 ? 'active' : 'locked') as
						| 'completed'
						| 'active'
						| 'locked';
				};

				// Map to Lesson type with UI-specific fields
				type LessonWithStatus = Lesson & {
					progress: number;
					status: 'completed' | 'active' | 'locked';
					icon: string;
					color: string;
					iconColor: string;
					isContinue: boolean;
				};

				const mapLesson = (lesson: Lesson): LessonWithStatus => {
					const status = getRandomStatus();
					return {
						id: lesson.id,
						subject: lesson.subject,
						topic: lesson.topic,
						title: lesson.title,
						content: lesson.content,
						duration: lesson.duration,
						difficulty: lesson.difficulty,
						prerequisites: lesson.prerequisites,
						learning_objectives: lesson.learning_objectives,
						progress: Math.floor(Math.random() * 101),
						status,
						icon: getIconForSubject(lesson.subject),
						color: getColorForSubject(lesson.subject),
						iconColor: getIconColorForSubject(lesson.subject),
						isContinue: false,
					};
				};

				const allLessons: Lesson[] = [
					...mathArray.map(mapLesson),
					...mechanicsArray.map(mapLesson),
					...wavesArray.map(mapLesson),
					...electricityArray.map(mapLesson),
					...chemistryArray.map(mapLesson),
					...lifeArray.map(mapLesson),
				];

				setLessonsData(allLessons);
				setLoading(false);
			} catch (error) {
				console.debug('Error loading lessons:', error);
				setLoading(false);
			}
		};

		loadLessons();
	}, []);

	if (loading) {
		return (
			<div className="flex flex-col h-full items-center justify-center bg-background">
				<div className="animate-pulse">
					<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<HugeiconsIcon icon={LayoutLeftIcon} className="w-10 h-10 text-primary" />
					</div>
					<p className="text-muted-foreground">Loading lessons...</p>
				</div>
			</div>
		);
	}

	const filteredLessons = lessonsData.filter(
		(lesson) =>
			activeCategory === 'all' || lesson.subject.toLowerCase() === activeCategory.toLowerCase()
	);

	return (
		<div className="flex flex-col h-full min-w-0 bg-background overflow-x-hidden">
			{/* Header */}
			<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 shrink-0">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<h1 className="text-2xl font-black text-foreground tracking-tight">Grade 12 Prep</h1>
						<p className="text-muted-foreground font-medium flex items-center gap-1.5 text-sm">
							Keep up the streak!{' '}
							<HugeiconsIcon
								icon={FireIcon}
								className="w-4 h-4 text-brand-amber fill-brand-amber"
							/>{' '}
							<span className="font-bold text-foreground">5 days</span>
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full bg-card border-border shadow-sm gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4"
					>
						<HugeiconsIcon icon={GlobeIcon} className="w-4 h-4 text-muted-foreground" />
						<span className="font-bold text-foreground hidden sm:inline">English</span>
						<HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-muted-foreground/50" />
					</Button>
				</div>

				{/* Category selector */}
				<nav
					className="flex gap-2 sm:gap-3 mt-6 sm:mt-8 overflow-x-auto no-scrollbar"
					aria-label="Lesson categories"
				>
					{[
						{ id: 'all', name: 'All Subjects', icon: LayoutLeftIcon },
						{ id: 'mathematics', name: 'Mathematics', icon: LayoutLeftIcon },
						{ id: 'physical_sciences', name: 'Physical Sciences', icon: Chemistry01Icon },
						{ id: 'life_sciences', name: 'Life Sciences', icon: LayoutLeftIcon },
						{ id: 'languages', name: 'Languages', icon: TranslateIcon },
					].map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setActiveCategory(cat.id)}
							aria-pressed={activeCategory === cat.id ? 'true' : 'false'}
							className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${
								activeCategory === cat.id
									? 'bg-foreground text-background border-foreground shadow-lg'
									: 'bg-card text-muted-foreground border-border hover:text-foreground'
							}`}
						>
							<HugeiconsIcon
								icon={cat.icon}
								className={`w-4 h-4 ${activeCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`}
							/>
							{cat.name}
						</button>
					))}
				</nav>
			</header>

			{/* Path Content */}
			<ScrollArea className="flex-1">
				<main className="px-4 sm:px-6 py-4 relative">
					{/* Vertical Line */}
					<div className="absolute left-9.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-border/50 z-0" />

					<div className="space-y-6">
						{filteredLessons.map((lesson) => (
							<div key={lesson.id} className="flex gap-6 relative z-10">
								{/* Node Icon */}
								<div className="shrink-0 pt-4 flex flex-col items-center">
									{lesson.status === 'completed' && (
										<div className="w-8 h-8 rounded-full bg-brand-amber flex items-center justify-center shadow-lg shadow-brand-amber/20 translate-y-1">
											<HugeiconsIcon
												icon={Tick01Icon}
												className="w-5 h-5 text-primary-foreground stroke-[3px]"
											/>
										</div>
									)}
									{lesson.status === 'active' && (
										<div className="w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20 translate-y-1">
											<div className="w-2.5 h-2.5 rounded-full bg-primary" />
										</div>
									)}
									{lesson.status === 'locked' && (
										<div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center translate-y-1">
											<HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-muted-foreground/50" />
										</div>
									)}
								</div>

								{/* Lesson Card */}
								<div className="flex-1">
									<Card
										className={`p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${
											lesson.status === 'active'
												? 'border-primary bg-card'
												: 'border-transparent bg-card'
										}`}
									>
										{lesson.isContinue && (
											<div className="absolute top-0 right-0">
												<div className="bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">
													Continue
												</div>
											</div>
										)}
										<div className="flex items-center justify-between">
											<div className="space-y-1.5 pr-4">
												<p
													className={`text-[10px] font-black uppercase tracking-widest ${
														lesson.status === 'active'
															? 'text-primary'
															: lesson.status === 'completed'
																? 'text-brand-amber'
																: lesson.subject.includes('LANGUAGE')
																	? 'text-brand-red'
																	: lesson.subject.includes('LIFE')
																		? 'text-brand-green'
																		: 'text-muted-foreground'
													}`}
												>
													{lesson.subject}
												</p>
												<h3 className="text-xl font-bold text-foreground leading-tight">
													{lesson.title}
												</h3>

												<div className="pt-2">
													<TTSButton
														text={`${lesson.title}. ${lesson.content.slice(0, 200)}`}
														title={lesson.title}
														showPlayer={true}
													/>
												</div>

												{lesson.progress !== undefined ? (
													<div className="flex items-center gap-3 pt-2">
														<div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
															<div
																className={`h-full rounded-full transition-all ${
																	lesson.status === 'active' ? 'bg-primary' : 'bg-brand-amber'
																}`}
																style={{ width: `${lesson.progress}%` }}
															/>
														</div>
														<span className="text-xs font-bold text-muted-foreground">
															{lesson.progress}%
														</span>
													</div>
												) : (
													<div className="flex items-center gap-1.5 pt-2 text-muted-foreground font-medium text-xs">
														<HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />
														{lesson.time}
													</div>
												)}
											</div>
											<div
												className={`w-16 h-16 rounded-4xl flex items-center justify-center text-3xl shadow-inner ${lesson.color} border border-border shrink-0 transform group-hover:scale-110 transition-transform`}
											>
												{lesson.status === 'active' ? (
													<div className="relative">
														<div className="absolute inset-0 blur-lg bg-brand-amber opacity-50" />
														<span className="relative z-10">⚡</span>
													</div>
												) : (
													lesson.icon
												)}
											</div>
										</div>
									</Card>
								</div>
							</div>
						))}

						{/* Premium Upsell Card */}
						<div className="flex gap-6 relative z-10 pt-4">
							<div className="w-8 shrink-0" /> {/* Spacer for alignment */}
							<Card className="flex-1 bg-foreground text-background p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden shadow-2xl border-none">
								<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
								<div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

								<div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group cursor-pointer hover:scale-105 transition-transform">
									<HugeiconsIcon icon={Medal01Icon} className="w-8 h-8 text-yellow-400" />
									<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-foreground" />
								</div>

								<div className="space-y-2">
									<h3 className="text-2xl font-black tracking-tight">Unlock Past Papers</h3>
									<p className="text-muted-foreground font-medium text-sm px-4">
										Get access to 2018-2023 exams with memos.
									</p>

									<Button className="w-full bg-background text-foreground hover:bg-muted h-14 rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all active:scale-[0.98]">
										Go Premium
									</Button>
								</div>
							</Card>
						</div>
					</div>

					{/* Space for bottom nav */}
					<div className="h-32" />
				</main>
			</ScrollArea>
		</div>
	);
}
