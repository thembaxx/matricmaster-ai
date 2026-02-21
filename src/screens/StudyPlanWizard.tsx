'use client';

import {
	ArrowLeft,
	Book,
	Calculator,
	Check,
	FlaskConical,
	Landmark,
	Languages,
	Lock,
	Microscope,
	Play,
	Settings2,
	Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useSession } from '@/lib/auth-client';
import { createStudyPlanAction } from '@/lib/db/study-plan-actions';

const subjects = [
	{ id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-blue-500' },
	{ id: 'physics', name: 'Physical Sci', icon: FlaskConical, color: 'text-blue-500' },
	{ id: 'life', name: 'Life Sciences', icon: Microscope, color: 'text-zinc-500' },
	{ id: 'english', name: 'English HL', icon: Book, color: 'text-zinc-500' },
	{ id: 'afrikaans', name: 'Afrikaans FAL', icon: Languages, color: 'text-zinc-500' },
	{ id: 'accounting', name: 'Accounting', icon: Landmark, color: 'text-zinc-500' },
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

			// Save plan to database if user is logged in
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
			<div className="flex flex-col items-center justify-center h-full bg-white dark:bg-[#0a0f18] p-6 font-inter">
				<div className="w-32 h-32 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-8 animate-pulse">
					<Sparkles className="w-16 h-16 text-blue-500" />
				</div>
				<h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3 text-center">
					Generating Your Path...
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-xs leading-relaxed">
					Our AI is analyzing the curriculum and your goals to create the perfect quest map.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-[#0a0f18] relative font-inter">
			{/* Header */}
			<header className="px-6 py-4 flex items-center justify-between shrink-0">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/')}
					className="rounded-full"
				>
					<ArrowLeft className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
				</Button>
				<h1 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Study Plan</h1>
				<Button variant="ghost" size="icon" className="rounded-full">
					<Settings2 className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
				</Button>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 space-y-8 pb-48 max-w-2xl mx-auto w-full">
					{/* Focus Areas Section */}
					<div className="space-y-4">
						<div className="flex justify-between items-end">
							<h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
								Focus Areas
							</h2>
							<span className="text-sm font-semibold text-blue-500">Step 1 of 3</span>
						</div>
						<div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
							<div
								className="h-full w-1/3 rounded-full"
								style={{
									background: 'linear-gradient(90deg, #60a5fa 0%, #a855f7 100%)',
								}}
							/>
						</div>
					</div>

					{/* Question Section */}
					<div className="space-y-2">
						<h3 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">
							What subjects are you tackling for Finals?
						</h3>
						<p className="text-zinc-500 dark:text-zinc-400 text-sm">
							Our AI will prioritize these in your daily quests.
						</p>
					</div>

					{/* Subject Grid */}
					<div className="grid grid-cols-2 gap-4">
						{subjects.map((subject) => {
							const isSelected = selectedSubjects.includes(subject.id);
							return (
								<button
									type="button"
									key={subject.id}
									onClick={() => toggleSubject(subject.id)}
									className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4 ${
										isSelected
											? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5'
											: 'border-transparent bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
									}`}
								>
									{isSelected && (
										<div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
											<Check className="w-4 h-4 text-white" strokeWidth={3} />
										</div>
									)}
									<div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
										<subject.icon
											className={`w-8 h-8 ${isSelected ? 'text-blue-500' : 'text-zinc-400'}`}
										/>
									</div>
									<span
										className={`font-bold ${isSelected ? 'text-blue-500' : 'text-zinc-600 dark:text-zinc-400'}`}
									>
										{subject.name}
									</span>
								</button>
							);
						})}
					</div>

					{/* Weekly Commitment Section */}
					<div className="space-y-6 pt-4">
						<div className="flex justify-between items-center">
							<h4 className="text-lg font-bold text-zinc-900 dark:text-white">Weekly Commitment</h4>
							<Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl px-4 py-2 hover:bg-blue-50 border-none font-bold text-base">
								{weeklyHours[0]} Hours
							</Badge>
						</div>
						<div className="px-1">
							<Slider
								value={weeklyHours}
								onValueChange={setWeeklyHours}
								min={2}
								max={20}
								step={1}
								className="py-4"
							/>
						</div>
						<div className="flex justify-between text-xs font-semibold text-zinc-400">
							<span>2h / week</span>
							<span>20h+ / week</span>
						</div>
						<p className="text-sm text-zinc-400 dark:text-zinc-500 text-center italic">
							Recommended: 10-15 hours for distinction pass.
						</p>
					</div>

					{/* Preview Section */}
					<div className="p-8 bg-[#f8faff] dark:bg-zinc-900/50 rounded-[2.5rem] space-y-8">
						<div className="flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-blue-500" />
							<h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
								Preview: Learning Path
							</h3>
						</div>

						{/* Vertical Path Map */}
						<div className="flex flex-col items-center relative gap-4">
							{/* Connecting Line */}
							<div className="absolute top-8 bottom-8 w-1 bg-zinc-200 dark:bg-zinc-800" />

							{/* Node 1: Completed */}
							<div className="relative z-10 w-16 h-16 rounded-full bg-white dark:bg-zinc-900 border-2 border-emerald-500 flex items-center justify-center">
								<Check className="w-8 h-8 text-emerald-500" strokeWidth={3} />
							</div>

							{/* Node 2: Current */}
							<div className="flex flex-col items-center gap-2 relative">
								<div className="relative z-10 w-16 h-16 rounded-full border-[3px] border-blue-500 bg-white dark:bg-zinc-900 flex items-center justify-center">
									<Play className="w-6 h-6 text-blue-500 fill-blue-500" />
									<div className="absolute -top-1 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
								</div>
								<div className="bg-white dark:bg-zinc-900 px-3 py-1 rounded-full shadow-sm">
									<span className="text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">
										Start Here
									</span>
								</div>
							</div>

							{/* Node 3: Locked */}
							<div className="relative z-10 w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
								<Lock className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
							</div>
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Footer */}
			<div className="absolute bottom-6 left-6 right-6 z-30">
				<Button
					className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all gap-2"
					onClick={handleGenerate}
					disabled={selectedSubjects.length === 0}
				>
					Generate My Plan
					<Sparkles className="w-5 h-5" />
				</Button>
			</div>
		</div>
	);
}
