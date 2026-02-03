import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import type { Screen } from '@/types';
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
import { useState } from 'react';

interface StudyPlanWizardProps {
	onNavigate: (s: Screen) => void;
}

const subjects = [
	{ id: 'math', name: 'Mathematics', icon: Calculator, color: 'bg-blue-500' },
	{ id: 'physics', name: 'Physical Sci', icon: Atom, color: 'bg-purple-500' },
	{ id: 'life', name: 'Life Sciences', icon: Microscope, color: 'bg-green-500' },
	{ id: 'english', name: 'English HL', icon: BookOpen, color: 'bg-pink-500' },
	{ id: 'afrikaans', name: 'Afrikaans FAL', icon: Languages, color: 'bg-orange-500' },
	{ id: 'accounting', name: 'Accounting', icon: PieChart, color: 'bg-yellow-500' },
];

export default function StudyPlanWizard({ onNavigate }: StudyPlanWizardProps) {
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
			onNavigate('PATH');
		}, 2000);
	};

	if (isGenerating) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
				<div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 animate-pulse">
					<Sparkles className="w-12 h-12 text-blue-500" />
				</div>
				<h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
					Generating Plan...
				</h2>
				<p className="text-sm text-zinc-500 text-center">
					Our AI is analyzing the curriculum and your goals to create the perfect quest map.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-4 mb-4">
					<Button variant="ghost" size="icon" onClick={() => onNavigate('DASHBOARD')}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<div className="flex-1">
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
								Step {currentStep} of 3
							</span>
						</div>
						<Progress value={(currentStep / 3) * 100} className="h-2" />
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 space-y-6 pb-32">
					{/* Question */}
					<div>
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
							What subjects are you tackling for Finals?
						</h2>
						<p className="text-sm text-zinc-500">Select all subjects you're studying this year</p>
					</div>

					{/* Subject Cards */}
					<div className="grid grid-cols-2 gap-4">
						{subjects.map((subject) => (
							<Card
								key={subject.id}
								className={`p-4 cursor-pointer transition-all ${
									selectedSubjects.includes(subject.id)
										? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'hover:border-zinc-300 dark:hover:border-zinc-600'
								}`}
								onClick={() => toggleSubject(subject.id)}
							>
								<div className="flex flex-col items-center gap-3">
									<div
										className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center`}
									>
										<subject.icon className="w-6 h-6 text-white" />
									</div>
									<span className="text-sm font-medium text-center">{subject.name}</span>
									{selectedSubjects.includes(subject.id) && (
										<div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
											<Check className="w-4 h-4 text-white" />
										</div>
									)}
								</div>
							</Card>
						))}
					</div>

					{/* Weekly Commitment */}
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<Label className="text-base font-semibold">Weekly Commitment</Label>
							<Badge variant="secondary" className="text-sm">
								{weeklyHours[0]} Hours
							</Badge>
						</div>
						<Slider value={weeklyHours} onValueChange={setWeeklyHours} min={2} max={20} step={1} />
						<div className="flex justify-between text-xs text-zinc-500">
							<span>2h / week</span>
							<span>20h+ / week</span>
						</div>
						<p className="text-xs text-zinc-400 text-center">
							Recommended: 15-20 hours for distinction pass
						</p>
					</div>

					{/* Preview */}
					<Card className="p-4 bg-zinc-50 dark:bg-zinc-800/50">
						<h3 className="font-semibold text-sm mb-3">Your Learning Path Preview</h3>
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<div className="w-2 h-2 rounded-full bg-green-500" />
								<span className="text-zinc-600 dark:text-zinc-400">
									{selectedSubjects.length} subjects selected
								</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<div className="w-2 h-2 rounded-full bg-blue-500" />
								<span className="text-zinc-600 dark:text-zinc-400">
									{weeklyHours[0]} hours weekly study time
								</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<div className="w-2 h-2 rounded-full bg-purple-500" />
								<span className="text-zinc-600 dark:text-zinc-400">
									AI-generated personalized schedule
								</span>
							</div>
						</div>
					</Card>
				</main>
			</ScrollArea>

			{/* Footer */}
			<footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6">
				<Button
					className="w-full bg-blue-600 hover:bg-blue-700"
					size="lg"
					onClick={handleGenerate}
					disabled={selectedSubjects.length === 0}
				>
					<Sparkles className="w-4 h-4 mr-2" />
					Generate My Plan
				</Button>
			</footer>
		</div>
	);
}
