import {
	ArrowLeft,
	Atom,
	BookOpen,
	Calculator,
	Check,
	Languages,
	Microscope,
	PieChart,
	Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

// import type { Screen } from '@/types'; // Removed unused import

const subjects = [
	{ id: 'math', name: 'Mathematics', icon: Calculator, color: 'bg-brand-blue' },
	{ id: 'physics', name: 'Physical Sci', icon: Atom, color: 'bg-brand-purple' },
	{ id: 'life', name: 'Life Sciences', icon: Microscope, color: 'bg-brand-green' },
	{ id: 'english', name: 'English HL', icon: BookOpen, color: 'bg-pink-500' },
	{ id: 'afrikaans', name: 'Afrikaans FAL', icon: Languages, color: 'bg-brand-orange' },
	{ id: 'accounting', name: 'Accounting', icon: PieChart, color: 'bg-brand-amber' },
];

export default function StudyPlanWizard() {
	const router = useRouter();
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['math']);
	const [weeklyHours, setWeeklyHours] = useState([12]);
	const [currentStep] = useState(1);
	const [isGenerating, setIsGenerating] = useState(false);

	const toggleSubject = (subjectId: string) => {
		setSelectedSubjects((prev) =>
			prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
		);
	};

	const handleGenerate = () => {
		setIsGenerating(true);
		setTimeout(() => {
			setIsGenerating(false);
			router.push('/study-path');
		}, 2000);
	};

	if (isGenerating) {
		return (
			<div className="flex flex-col items-center justify-center h-full bg-zinc-50 dark:bg-zinc-950 p-6 font-lexend">
				<div className="w-32 h-32 rounded-[2.5rem] bg-brand-blue/10 flex items-center justify-center mb-8 animate-float">
					<Sparkles className="w-16 h-16 text-brand-blue" />
				</div>
				<h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-3 text-center">
					Generating Your Path...
				</h2>
				<p className="text-sm font-bold text-zinc-500 text-center max-w-xs leading-relaxed">
					Our AI is analyzing the curriculum and your goals to create the perfect quest map.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend relative">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="flex items-center gap-4 max-w-2xl mx-auto w-full">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push('/')}
						className="rounded-full"
					>
						<ArrowLeft className="w-6 h-6" />
					</Button>
					<div className="flex-1">
						<div className="flex justify-between items-center mb-3">
							<span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
								Step {currentStep} of 3
							</span>
						</div>
						<Progress value={(currentStep / 3) * 100} className="h-2 rounded-full" />
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 space-y-10 pb-48 max-w-2xl mx-auto w-full">
					{/* Question */}
					<div className="space-y-3">
						<h2 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight">
							What subjects are you tackling?
						</h2>
						<p className="text-zinc-500 font-bold">Select all subjects you're studying this year</p>
					</div>

					{/* Subject Cards */}
					<div className="grid grid-cols-2 gap-4">
						{subjects.map((subject) => (
							<Card
								key={subject.id}
								className={`p-6 cursor-pointer transition-all rounded-[2.5rem] border-2 group ${
									selectedSubjects.includes(subject.id)
										? 'border-brand-blue bg-brand-blue/5 shadow-xl shadow-brand-blue/10'
										: 'border-transparent bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-200 dark:hover:border-zinc-800'
								}`}
								onClick={() => toggleSubject(subject.id)}
							>
								<div className="flex flex-col items-center gap-4 relative">
									<div
										className={`w-16 h-16 rounded-2xl ${subject.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
									>
										<subject.icon className="w-8 h-8 text-white" />
									</div>
									<span className="text-sm font-black text-zinc-900 dark:text-white text-center">
										{subject.name}
									</span>
									{selectedSubjects.includes(subject.id) && (
										<div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center shadow-lg animate-in zoom-in border-4 border-white dark:border-zinc-900">
											<Check className="w-3 h-3 text-white" strokeWidth={4} />
										</div>
									)}
								</div>
							</Card>
						))}
					</div>

					{/* Weekly Commitment */}
					<div className="space-y-6 pt-4">
						<div className="flex justify-between items-end px-1">
							<div className="space-y-1">
								<Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
									Commitment
								</Label>
								<h4 className="text-2xl font-black text-zinc-900 dark:text-white">
									Hours Per Week
								</h4>
							</div>
							<Badge className="bg-brand-blue text-white rounded-2xl px-5 py-2 text-xl font-black">
								{weeklyHours[0]}h
							</Badge>
						</div>
						<div className="px-2">
							<Slider
								value={weeklyHours}
								onValueChange={setWeeklyHours}
								min={2}
								max={40}
								step={1}
								className="py-4"
							/>
						</div>
						<div className="flex justify-between text-xs font-black text-zinc-400 uppercase tracking-widest px-1">
							<span>Casuall (2h)</span>
							<span>Scholar (40h+)</span>
						</div>
						<p className="text-[10px] font-bold text-zinc-400 text-center italic">
							Recommended: 15-20 hours for distinction pass
						</p>
					</div>

					{/* Preview */}
					<div className="p-8 bg-zinc-900 dark:bg-white rounded-[3rem] text-white dark:text-zinc-900 shadow-2xl space-y-6">
						<h3 className="font-black text-lg uppercase tracking-tighter">Plan Preview</h3>
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-zinc-100 flex items-center justify-center">
									<Check className="w-4 h-4 text-brand-green" />
								</div>
								<span className="font-bold">{selectedSubjects.length} subjects to master</span>
							</div>
							<div className="flex items-center gap-4">
								<div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-zinc-100 flex items-center justify-center">
									<Check className="w-4 h-4 text-brand-green" />
								</div>
								<span className="font-bold">{weeklyHours[0]} hours weekly dedication</span>
							</div>
							<div className="flex items-center gap-4">
								<div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-zinc-100 flex items-center justify-center">
									<Check className="w-4 h-4 text-brand-green" />
								</div>
								<span className="font-bold">AI-generated personalized roadmap</span>
							</div>
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Footer */}
			<footer className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 p-8 z-30">
				<Button
					className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] text-xl font-black shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
					onClick={handleGenerate}
					disabled={selectedSubjects.length === 0}
				>
					<Sparkles className="w-5 h-5 mr-3" />
					Generate My Path
				</Button>
			</footer>
		</div>
	);
}
