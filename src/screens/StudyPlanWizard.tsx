'use client';

import {
	ArrowLeft01Icon as ArrowLeft,
	BankIcon as Bank,
	Book01Icon as Book,
	Calculator01Icon as Calculator,
	CheckmarkCircle01Icon as Check,
	TestTube01Icon as Flask,
	Settings02Icon as GearSix,
	SquareLock01Icon as Lock,
	MicroscopeIcon as Microscope,
	PlayIcon as Play,
	SparklesIcon as Sparkle,
	TranslateIcon as Translate,
	Loading03Icon as CircleNotch,
} from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useSession } from '@/lib/auth-client';
import { createStudyPlanAction } from '@/lib/db/study-plan-actions';
import { cn } from '@/lib/utils';

const subjects = [
	{ id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-tiimo-blue' },
	{ id: 'physics', name: 'Physical Sci', icon: Flask, color: 'text-tiimo-purple' },
	{ id: 'life', name: 'Life Sciences', icon: Microscope, color: 'text-tiimo-green' },
	{ id: 'english', name: 'English HL', icon: Book, color: 'text-tiimo-pink' },
	{ id: 'afrikaans', name: 'Afrikaans FAL', icon: Translate, color: 'text-tiimo-orange' },
	{ id: 'accounting', name: 'Accounting', icon: Bank, color: 'text-tiimo-blue' },
];

export default function StudyPlanWizard() {
	const router = useRouter();
	const { data: session } = useSession();
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['math', 'physics']);
	const [weeklyHours, setWeeklyHours] = useState([12]);
	const [isGenerating, setIsGenerating] = useState(false);

	const toggleSubject = (subjectId: string) => {
		setSelectedSubjects((prev) =>
			prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
		);
	};

	const handleGenerate = async () => {
		setIsGenerating(true);
		try {
			const { generateStudyPlan } = await import('@/services/geminiService');
			const subjectNames = subjects
				.filter((s) => selectedSubjects.includes(s.id))
				.map((s) => s.name);

			const planText = await generateStudyPlan(subjectNames, weeklyHours[0]);

			// FloppyDisk plan to database if user is logged in
			if (session?.user?.id) {
				const title = `${subjectNames.join(', ')} Study Plan`;
				await createStudyPlanAction(
					session.user.id,
					title,
					undefined, // targetExamDate
					subjectNames.join(', '), // focusAreas
					`${weeklyHours[0]} hours per week - ${planText}` // weeklyGoals
				);
			}

			router.push('/study-path');
		} catch (error) {
			console.error('Failed to generate study plan:', error);
			router.push('/study-path');
		} finally {
			setIsGenerating(false);
		}
	};

	if (isGenerating) {
		return (
			<div className="flex flex-col items-center justify-center h-full bg-background p-6">
				<div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 animate-pulse">
					<Sparkle className="w-16 h-16 text-primary stroke-[3]" />
				</div>
				<h2 className="text-3xl font-black text-foreground mb-3 text-center">
					Generating your path...
				</h2>
				<p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
					We are analyzing the curriculum and your goals to create the perfect quest map.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 relative">
			{/* Header */}
			<header className="px-6 py-8 flex items-center justify-between shrink-0">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/')}
					className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-muted/20 transition-all"
				>
					<ArrowLeft size={24} className="stroke-[3px]" />
				</Button>
				<h1 className="text-xl font-black text-foreground tracking-tight">
					Custom plan
				</h1>
				<Button
					variant="ghost"
					size="icon"
					className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-muted/20 transition-all"
				>
					<GearSix size={24} className="stroke-[3px]" />
				</Button>
			</header>

			<ScrollArea className="flex-1 no-scrollbar">
				<main className="px-8 py-4 space-y-12 pb-64 max-w-3xl mx-auto w-full">
					{/* Progress Section */}
					<div className="space-y-6">
						<div className="flex justify-between items-end px-1">
							<div className="space-y-1">
								<h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Focus</h2>
								<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Step 1 of 3</p>
							</div>
							<span className="text-2xl font-black text-primary">33%</span>
						</div>
						<div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden p-1 shadow-inner">
							<div className="h-full w-1/3 rounded-full bg-primary shadow-lg" />
						</div>
					</div>

					{/* Question Section */}
					<div className="space-y-3">
						<h3 className="text-3xl font-black text-foreground leading-tight tracking-tight">
							What subjects are you tackling for finals?
						</h3>
						<p className="text-lg font-bold text-muted-foreground/60 leading-relaxed">
							Your personalized learning journey will focus on these key areas.
						</p>
					</div>

					{/* Subject Grid */}
					<div className="grid grid-cols-2 gap-6">
						{subjects.map((subject) => {
							const isSelected = selectedSubjects.includes(subject.id);
							return (
								<m.button
									whileHover={{ scale: 1.02, y: -4 }}
									whileTap={{ scale: 0.98 }}
									type="button"
									key={subject.id}
									onClick={() => toggleSubject(subject.id)}
									className={cn(
										"relative p-8 rounded-[2.5rem] transition-all cursor-pointer flex flex-col items-center gap-6 border-none shadow-[0_15px_40px_rgba(0,0,0,0.05)]",
										isSelected
											? 'bg-primary text-white shadow-primary/30'
											: 'bg-muted/5 hover:bg-muted/10'
									)}
								>
									{isSelected && (
										<div className="absolute top-4 right-4 w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center shadow-lg">
											<Check size={18} className="stroke-[4px]" />
										</div>
									)}
									<div className={cn(
										"w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all duration-500",
										isSelected ? "bg-white/20" : "bg-white dark:bg-zinc-900"
									)}>
										<subject.icon
											size={40}
											className={cn("stroke-[2.5px]", isSelected ? 'text-white' : 'text-muted-foreground/40')}
										/>
									</div>
									<span
										className={cn("text-md font-black uppercase tracking-widest", isSelected ? 'text-white' : 'text-muted-foreground/60')}
									>
										{subject.name}
									</span>
								</m.button>
							);
						})}
					</div>

					{/* Weekly Commitment Section */}
					<div className="space-y-8 pt-6">
						<div className="flex justify-between items-end px-2">
							<div className="space-y-1">
								<h4 className="text-2xl font-black text-foreground uppercase">Commitment</h4>
								<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">Time per week</p>
							</div>
							<div className="h-16 px-8 rounded-2xl bg-tiimo-orange/10 flex items-center justify-center text-3xl font-black text-tiimo-orange">
								{weeklyHours[0]}h
							</div>
						</div>
						<div className="px-4">
							<Slider
								value={weeklyHours}
								onValueChange={setWeeklyHours}
								min={2}
								max={20}
								step={1}
								className="py-6"
							/>
						</div>
						<div className="flex justify-between px-2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
							<span>Casual (2h)</span>
							<span>Elite (20h+)</span>
						</div>
					</div>

					{/* Preview Section */}
					<div className="p-10 bg-muted/5 rounded-[3.5rem] space-y-10 border-none">
						<div className="flex items-center gap-4">
							<Sparkle size={20} className="text-tiimo-purple stroke-[3px]" />
							<h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40">
								Roadmap preview
							</h3>
						</div>

						{/* Vertical Path */}
						<div className="flex flex-col items-center relative gap-8 pb-4">
							<div className="absolute top-10 bottom-10 w-2 bg-muted/10 rounded-full" />

							{/* Node 1: Completed */}
							<div className="relative z-10 w-20 h-20 rounded-[1.5rem] bg-tiimo-green text-white flex items-center justify-center shadow-xl shadow-tiimo-green/20">
								<Check size={32} className="stroke-[4px]" />
							</div>

							{/* Node 2: Current */}
							<div className="flex flex-col items-center gap-4 relative">
								<m.div
									animate={{ scale: [1, 1.1, 1] }}
									transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
									className="relative z-10 w-24 h-24 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30"
								>
									<Play size={40} className="fill-current stroke-[3px] ml-1" />
									<div className="absolute -top-1 -right-1 w-6 h-6 bg-tiimo-pink rounded-xl border-4 border-white dark:border-zinc-950 shadow-lg" />
								</m.div>
								<div className="bg-white dark:bg-zinc-900 px-5 py-2 rounded-2xl shadow-xl border-none">
									<span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
										Your Start
									</span>
								</div>
							</div>

							{/* Node 3: Locked */}
							<div className="relative z-10 w-20 h-20 rounded-[1.5rem] bg-muted/20 text-muted-foreground/20 flex items-center justify-center">
								<Lock size={32} className="stroke-[3px]" />
							</div>
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Footer Action */}
			<div className="fixed bottom-10 left-10 right-10 z-40 max-w-3xl mx-auto">
				<m.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
					<Button
						className="w-full h-24 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2.5rem] text-2xl font-black shadow-[0_30px_70px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center gap-4 border-none"
						onClick={handleGenerate}
						disabled={selectedSubjects.length === 0}
					>
						<span>Build study path</span>
						<Sparkle size={32} className="stroke-[3.5px] text-tiimo-purple fill-tiimo-purple/20" />
					</Button>
				</m.div>
			</div>
		</div>
	);
}
