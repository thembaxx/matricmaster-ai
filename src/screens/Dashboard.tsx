'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useEffect, useState, useTransition } from 'react';
import {
	Calculator01Icon,
	Atom01Icon,
	FlashIcon,
	MicroscopeIcon,
	Cancel01Icon,
	SparklesIcon,
	ChartLineData01Icon,
	FlashlightIcon,
	ArrowRight01Icon,
} from 'hugeicons-react';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { SubjectCard } from '@/components/Dashboard/SubjectCard';
import { AIThinkingGradient } from '@/components/AI/AIThinkingGradient';
import { TopicMasteryCard } from '@/components/Dashboard/TopicMasteryCard';
import { ChallengesList } from '@/components/Dashboard/ChallengesList';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBJECTS } from '@/constants/mock-data';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import type { AuthSession } from '@/lib/auth';
import type { UserAchievement } from '@/lib/db/achievement-actions';
import type { UserProgressSummary } from '@/lib/db/progress-actions';
import { useNotificationStore } from '@/stores/useNotificationStore';

const ICON_MAP: Record<string, React.ElementType> = {
	Calculator: Calculator01Icon,
	Atom: Atom01Icon,
	FlaskConical: FlashIcon,
	Microscope: MicroscopeIcon,
};

export interface DashboardInitialStreak {
	currentStreak: number;
	bestStreak: number;
	lastActivityDate: string | null;
}

interface DashboardProps {
	initialProgress?: UserProgressSummary | null;
	initialStreak?: DashboardInitialStreak | null;
	initialAchievements?: {
		unlocked: UserAchievement[];
		available: any;
	} | null;
	session?: AuthSession | null;
}

export default function Dashboard({
	initialProgress,
	initialStreak,
	initialAchievements,
	session,
}: DashboardProps = {}) {
	const { unreadCount } = useNotificationStore();
	const [isPending, startTransition] = useTransition();
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
	const [isThinking, setIsThinking] = useState(false);

	const progressData = initialProgress
		? {
				totalQuestions: initialProgress.totalQuestionsAttempted,
				accuracy: initialProgress.accuracy,
				totalPoints: initialProgress.totalMarksEarned * 10,
			}
		: null;

	const handleSubjectClick = (id: string) => {
		setSelectedSubjectId(id);
		// Simulate AI thinking for a moment when entering focus mode
		setIsThinking(true);
		setTimeout(() => setIsThinking(false), 2000);
	};

	const selectedSubject = SUBJECTS.find((s) => s.id === selectedSubjectId);

	if (!progressData) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-24 lg:pb-12 relative overflow-hidden">
			<DashboardHeader
				userName={session?.user?.name ?? undefined}
				userImage={session?.user?.image ?? undefined}
				unreadCount={unreadCount}
			/>

			<div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
				<m.main
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="px-6 py-8 space-y-12 max-w-2xl mx-auto"
				>
					{/* Welcome Section */}
					<m.section variants={STAGGER_ITEM} className="space-y-2">
						<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
							Continue <span className="text-electric-blue">Learning</span>.
						</h1>
						<p className="text-muted-foreground font-medium text-lg leading-relaxed">
							Pick up where you left off or start a new challenge.
						</p>
					</m.section>

					{/* Stats Highlights */}
					<m.section variants={STAGGER_ITEM} className="grid grid-cols-2 gap-4">
						<Card className="p-6 squircle bg-neutral-50 dark:bg-neutral-900 border-none shadow-none flex flex-col gap-4">
							<div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
								<FlashlightIcon variant="solid" className="text-amber-500 w-5 h-5" />
							</div>
							<div>
								<p className="text-3xl font-black">{initialStreak?.currentStreak ?? 0}</p>
								<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Day Streak</p>
							</div>
						</Card>
						<Card className="p-6 squircle bg-neutral-50 dark:bg-neutral-900 border-none shadow-none flex flex-col gap-4">
							<div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
								<ChartLineData01Icon className="text-electric-blue w-5 h-5" />
							</div>
							<div>
								<p className="text-3xl font-black">{progressData.accuracy}%</p>
								<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accuracy</p>
							</div>
						</Card>
					</m.section>

					{/* Subjects Feed */}
					<m.section variants={STAGGER_ITEM} className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
								My Subjects
							</h2>
						</div>
						<div className="space-y-4">
							{SUBJECTS.map((subject) => (
								<SubjectCard
									key={subject.id}
									id={subject.id}
									name={subject.name}
									topics={subject.topics}
									icon={ICON_MAP[subject.icon] || Calculator}
									onClick={() => handleSubjectClick(subject.id)}
									layoutId={subject.id}
								/>
							))}
						</div>
					</m.section>

					{/* Key Functionality Restored */}
					<m.section variants={STAGGER_ITEM} className="space-y-6">
						<TopicMasteryCard />
						<ChallengesList />
					</m.section>

					{/* AI Suggestion Card */}
					<m.section variants={STAGGER_ITEM}>
						<Card className="relative overflow-hidden p-8 squircle bg-neutral-900 text-white border-none group cursor-pointer active:scale-[0.98] transition-all">
							<AIThinkingGradient isThinking={true} className="opacity-30" />
							<div className="relative z-10 space-y-6">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center">
										<SparklesIcon size={20} className="text-white" />
									</div>
									<span className="text-xs font-black uppercase tracking-widest text-electric-blue">AI Recommendation</span>
								</div>
								<div className="space-y-2">
									<h3 className="text-2xl font-bold leading-tight">Master Calculus optimization in 15 minutes.</h3>
									<p className="text-neutral-400 font-medium">Based on your recent practice in Mathematics Paper 1.</p>
								</div>
								<Button className="w-full h-14 squircle bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-xs">
									Start Challenge
								</Button>
							</div>
						</Card>
					</m.section>
				</m.main>
			</div>

			{/* Focus Mode Expansion */}
			<AnimatePresence>
				{selectedSubjectId && selectedSubject && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-background flex flex-col"
					>
						<div className="flex-1 overflow-y-auto">
							<div className="p-6 md:p-12 max-w-2xl mx-auto w-full space-y-12 pb-32">
								<div className="flex items-center justify-between">
									<m.div
										layoutId={selectedSubject.id}
										className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center"
									>
										{(() => {
											const Icon = ICON_MAP[selectedSubject.icon] || Calculator01Icon;
											return <Icon size={32} className="text-foreground" />;
										})()}
									</m.div>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full h-12 w-12 bg-secondary/50 backdrop-blur-md"
										onClick={() => setSelectedSubjectId(null)}
									>
										<Cancel01Icon size={24} className="text-foreground" />
									</Button>
								</div>

								<div className="space-y-4">
									<Badge className="bg-electric-blue/10 text-electric-blue border-none rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-black">
										Topic Mastery
									</Badge>
									<h2 className="text-5xl font-extrabold tracking-tighter">{selectedSubject.name}</h2>
									<p className="text-xl text-muted-foreground font-medium leading-relaxed">
										{selectedSubject.topics}
									</p>
								</div>

								<div className="grid gap-4">
									{[
										'Past Exam Papers',
										'Topic Breakdowns',
										'AI Tutor Assistance',
										'Practice Quizzes',
									].map((item, idx) => (
										<m.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.2 + idx * 0.1 }}
											key={item}
											className="p-6 squircle bg-secondary/50 border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-secondary transition-colors"
										>
											<span className="text-lg font-bold">{item}</span>
											<ArrowRight01Icon size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
										</m.div>
									))}
								</div>

								<Card className="p-8 squircle bg-electric-blue text-white border-none shadow-2xl shadow-electric-blue/20">
									<div className="flex flex-col gap-6">
										<div className="space-y-2">
											<h3 className="text-2xl font-bold tracking-tight">AI Generated Study Path</h3>
											<p className="opacity-90 font-medium">We've identified 3 weak areas to focus on today.</p>
										</div>
										<Button className="w-full h-14 squircle bg-white text-electric-blue hover:bg-neutral-100 font-black uppercase tracking-widest text-xs">
											Begin Personalised Path
										</Button>
									</div>
								</Card>
							</div>
						</div>

						{/* Siri Gradient Backdrop in Focus Mode */}
						<AIThinkingGradient isThinking={isThinking} className="opacity-20" />
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}
