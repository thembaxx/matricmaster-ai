'use client';

import {
	ArrowLeft02Icon,
	BankIcon,
	Book01Icon,
	CalculatorIcon,
	Chemistry01Icon,
	LockIcon,
	MicroscopeIcon,
	PlayIcon,
	Settings01Icon,
	SparklesIcon,
	Tick01Icon,
	TranslateIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SuggestedReview } from '@/components/StudyPlan/SuggestedReview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { isQuotaError } from '@/lib/ai/quota-error';
import { useSession } from '@/lib/auth-client';
import { createStudyPlanAction } from '@/lib/db/study-plan-actions';

const subjects = [
	{ id: 'math', name: 'mathematics', icon: CalculatorIcon, color: 'text-blue-500' },
	{ id: 'physics', name: 'physical sci', icon: Chemistry01Icon, color: 'text-blue-500' },
	{ id: 'life', name: 'life sciences', icon: MicroscopeIcon, color: 'text-muted-foreground' },
	{ id: 'english', name: 'english hl', icon: Book01Icon, color: 'text-muted-foreground' },
	{ id: 'afrikaans', name: 'afrikaans fal', icon: TranslateIcon, color: 'text-muted-foreground' },
	{ id: 'accounting', name: 'accounting', icon: BankIcon, color: 'text-muted-foreground' },
];

export default function StudyPlanWizard() {
	const router = useRouter();
	const { data: session } = useSession();
	const { triggerQuotaError } = useGeminiQuotaModal();
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
			if (isQuotaError(error)) {
				triggerQuotaError();
			}
			console.debug('Failed to generate study plan:', error);
			router.push('/study-path');
		} finally {
			setIsGenerating(false);
		}
	};

	if (isGenerating) {
		return (
			<div className="flex flex-col items-center justify-center h-full bg-background p-6">
				<div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 animate-pulse">
					<HugeiconsIcon icon={SparklesIcon} className="w-16 h-16 text-primary" />
				</div>
				<h2 className="text-3xl font-black text-foreground mb-3 text-center">
					generating your path...
				</h2>
				<p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
					building your study path...
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background relative">
			{/* Header */}
			<header className="px-6 py-4 flex items-center justify-between shrink-0">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push('/')}
					aria-label="Go to home"
					className="rounded-full ios-active-scale"
					aria-label="Go back"
				>
					<HugeiconsIcon
						icon={ArrowLeft02Icon}
						className="w-6 h-6 text-muted-foreground"
						aria-hidden="true"
					/>
				</Button>
				<h1 className="text-[10px] font-black text-label-tertiary tracking-[0.2em]">study plan</h1>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Open settings"
					className="rounded-full ios-active-scale"
				>
					<HugeiconsIcon icon={Settings01Icon} className="w-6 h-6 text-muted-foreground" />
				</Button>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 space-y-8 pb-48 max-w-2xl mx-auto w-full">
					{/* Focus Areas Section */}
					<div className="space-y-4">
						<div className="flex justify-between items-end">
							<h2 className="text-3xl font-black text-foreground tracking-tight">focus areas</h2>
							<span className="text-[11px] font-black text-primary tracking-widest">
								step 1 of 3
							</span>
						</div>
						<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full w-1/3 rounded-full bg-primary"
								style={{
									background: 'var(--color-primary)',
								}}
							/>
						</div>
					</div>

					{/* Question Section */}
					<div className="space-y-2">
						<h3 className="text-2xl font-black text-foreground leading-tight">
							what subjects are you tackling for finals?
						</h3>
						<p className="text-muted-foreground text-sm">
							we'll prioritize these in your daily study plan.
						</p>
					</div>

					{/* Subject Grid */}
					<div className="grid grid-cols-2 gap-4">
						{subjects.map((subject) => {
							const isSelected = selectedSubjects.includes(subject.id);
							return (
								<Button
									type="button"
									variant="ghost"
									key={subject.id}
									onClick={() => toggleSubject(subject.id)}
									className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4 ios-active-scale ${
										isSelected
											? 'border-primary bg-primary/5'
											: 'border-transparent bg-secondary/50 hover:bg-secondary'
									}`}
								>
									{isSelected && (
										<div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
											<HugeiconsIcon
												icon={Tick01Icon}
												className="w-4 h-4 text-primary-foreground"
												strokeWidth={4}
											/>
										</div>
									)}
									<div className="w-16 h-16 rounded-full bg-card flex items-center justify-center shadow-sm">
										<HugeiconsIcon
											icon={subject.icon}
											className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
										/>
									</div>
									<span
										className={`text-sm font-black tracking-wider ${isSelected ? 'text-primary' : 'text-label-secondary'}`}
									>
										{subject.name}
									</span>
								</Button>
							);
						})}
					</div>

					{/* Weekly Commitment Section */}
					<div className="space-y-6 pt-4">
						<div className="flex justify-between items-center">
							<h4 className="text-lg font-black text-foreground">weekly commitment</h4>
							<Badge className="bg-primary/10 text-primary rounded-xl px-4 py-2 hover:bg-primary/20 border-none font-black text-base">
								{weeklyHours[0]} hours
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
						<div className="flex justify-between text-[10px] font-black text-label-tertiary tracking-widest">
							<span>2h / week</span>
							<span>20h+ / week</span>
						</div>
						<p className="text-xs text-label-tertiary text-center italic">
							recommended: 10-15 hours for distinction pass.
						</p>
					</div>

					{/* Preview Section */}
					<div className="p-8 premium-glass rounded-3xl space-y-8">
						<div className="flex items-center gap-2">
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
							<h3 className="text-[10px] font-black tracking-[0.2em] text-label-secondary">
								preview: learning path
							</h3>
						</div>

						{/* Vertical Path MapTrifold */}
						<div className="flex flex-col items-center relative gap-4">
							{/* Connecting Line */}
							<div className="absolute top-8 bottom-8 w-1 bg-border-strong" />

							{/* Node 1: Completed */}
							<div className="relative z-10 w-16 h-16 rounded-full bg-card border-2 border-success flex items-center justify-center shadow-lg">
								<HugeiconsIcon icon={Tick01Icon} className="w-8 h-8 text-success" strokeWidth={4} />
							</div>

							{/* Node 2: Current */}
							<div className="flex flex-col items-center gap-2 relative">
								<div className="relative z-10 w-16 h-16 rounded-full border-[3px] border-primary bg-card flex items-center justify-center shadow-xl animate-pulse-soft">
									<HugeiconsIcon icon={PlayIcon} className="w-6 h-6 text-primary fill-primary" />
									<div className="absolute -top-1 -right-0.5 w-4 h-4 bg-destructive rounded-full border-2 border-background" />
								</div>
								<div className="bg-card px-3 py-1 rounded-full shadow-sm border border-border/50">
									<span className="text-[10px] font-black text-foreground tracking-wider whitespace-nowrap">
										start here
									</span>
								</div>
							</div>

							{/* Node 3: Locked */}
							<div className="relative z-10 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
								<HugeiconsIcon icon={LockIcon} className="w-6 h-6 text-muted-foreground/50" />
							</div>
						</div>
					</div>
					<SuggestedReview />
				</main>
			</ScrollArea>

			{/* Footer */}
			<div className="absolute bottom-6 left-6 right-6 z-30">
				<Button
					className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-black tracking-widest shadow-xl shadow-primary/25 ios-active-scale transition-all gap-2"
					onClick={handleGenerate}
					disabled={selectedSubjects.length === 0}
				>
					generate my plan
					<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
				</Button>
			</div>
		</div>
	);
}
