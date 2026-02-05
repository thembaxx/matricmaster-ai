'use client';

import { ArrowLeft, CheckCircle2, Lightbulb, Loader2, SkipForward, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getExplanation } from '@/services/geminiService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const questions = [
	{
		id: 1.1,
		question: "Three forces act on an object so that the resultant force is zero. Which ONE of the following vector diagrams is the CORRECT representation of the three forces?",
		options: [
			{ id: 'A', text: 'Forces forming a closed triangle (tip-to-tail)' },
			{ id: 'B', text: 'Forces pointing in the same direction' },
			{ id: 'C', text: 'Two forces in one direction, one in the opposite' },
			{ id: 'D', text: 'Forces that do not meet at the ends' }
		],
		correctAnswer: 'A',
		hint: "For the resultant force to be zero, the vector sum must be zero. This is represented by vectors forming a closed triangle in a tip-to-tail arrangement.",
		topic: "Newton's Laws"
	},
	{
		id: 1.2,
		question: "Two large objects P and R, each of mass m, are placed r metres apart. They exert a gravitational force F on each other. If the mass of R is increased to 2m and the distance is increased to 2r, what is the new force?",
		options: [
			{ id: 'A', text: '1/2 F' },
			{ id: 'B', text: 'F' },
			{ id: 'C', text: '2 F' },
			{ id: 'D', text: '4 F' }
		],
		correctAnswer: 'A',
		hint: "Newton's Law of Universal Gravitation: F = G*m1*m2/r². Doubling one mass (2m) and doubling distance ((2r)² = 4r²) results in 2/4 = 1/2 of the original force.",
		topic: "Universal Gravitation"
	},
	{
		id: 1.3,
		question: "A ball is projected vertically upwards from the top of a building. Which point on a velocity-time graph corresponds to the greatest height above the ground?",
		options: [
			{ id: 'A', text: 'Point P (Initial velocity)' },
			{ id: 'B', text: 'Point Q (Where velocity is 0)' },
			{ id: 'C', text: 'Point R (On the way down)' },
			{ id: 'D', text: 'Point S (Impact)' }
		],
		correctAnswer: 'B',
		hint: "At the peak of its flight (greatest height), an object's instantaneous vertical velocity is exactly zero.",
		topic: "Vertical Projectile Motion"
	},
	{
		id: 1.4,
		question: "Two hard objects collide INELASTICALLY in an isolated system. Which ONE of the following statements is CORRECT?",
		options: [
			{ id: 'A', text: 'Both total momentum and total kinetic energy are conserved.' },
			{ id: 'B', text: 'Neither total momentum nor total kinetic energy is conserved.' },
			{ id: 'C', text: 'Total momentum is not conserved, but total kinetic energy is conserved.' },
			{ id: 'D', text: 'Total momentum is conserved, but total kinetic energy is not conserved.' }
		],
		correctAnswer: 'D',
		hint: "Momentum is always conserved in an isolated system. Inelastic collisions are defined by the loss of kinetic energy to other forms (heat, sound, etc.).",
		topic: "Momentum & Impulse"
	},
	{
		id: 1.5,
		question: "Engine P has a greater maximum power output than engine Q. Which ONE statement is CORRECT when both operate at maximum power?",
		options: [
			{ id: 'A', text: 'Q does more work than P in the same amount of time.' },
			{ id: 'B', text: 'P and Q do the same amount of work in the same amount of time.' },
			{ id: 'C', text: 'P and Q do the same amount of work, but Q does it faster.' },
			{ id: 'D', text: 'P and Q do the same amount of work, but P does it faster.' }
		],
		correctAnswer: 'D',
		hint: "Power = Work / Time. Higher power means performing the same amount of work in a shorter duration of time.",
		topic: "Work, Energy & Power"
	},
	{
		id: 1.6,
		question: "The spectral lines for star B are more red-shifted than those for star A. How do the frequencies and speeds compare?",
		options: [
			{ id: 'A', text: 'B has higher frequency and greater speed' },
			{ id: 'B', text: 'B has higher frequency and smaller speed' },
			{ id: 'C', text: 'B has lower frequency and greater speed' },
			{ id: 'D', text: 'B has lower frequency and smaller speed' }
		],
		correctAnswer: 'C',
		hint: "Red-shift indicates moving away (lower observed frequency). A larger red-shift means it is moving away at a greater speed.",
		topic: "Doppler Effect"
	},
	{
		id: 1.7,
		question: "Point P is to the right of sphere S. ER and ES are electric fields at P due to spheres R and S. If both point to the right, what are the charges?",
		options: [
			{ id: 'A', text: 'R is Positive, S is Negative' },
			{ id: 'B', text: 'R is Negative, S is Positive' },
			{ id: 'C', text: 'R is Negative, S is Negative' },
			{ id: 'D', text: 'R is Positive, S is Positive' }
		],
		correctAnswer: 'D',
		hint: "Electric field lines point away from positive charges. If the field at P (to the right) is pointing right, the source charges must be positive.",
		topic: "Electrostatics"
	},
	{
		id: 1.8,
		question: "In a circuit with internal resistance, Graph K has a negative slope (V vs I) and Graph L has a positive slope. Which voltmeters do they represent?",
		options: [
			{ id: 'A', text: 'K: V1 (Terminal), L: V1' },
			{ id: 'B', text: 'K: V1 (Terminal), L: V2 (External)' },
			{ id: 'C', text: 'K: V2 (External), L: V1 (Terminal)' },
			{ id: 'D', text: 'K: V2, L: V2' }
		],
		correctAnswer: 'B',
		hint: "Terminal voltage decreases as current increases (V = ε - Ir), while voltage across a resistor increases with current (V = IR).",
		topic: "Electric Circuits"
	},
	{
		id: 1.9,
		question: "What is the function of the split-ring commutator in an electric motor?",
		options: [
			{ id: 'A', text: 'It rotates the coil directly.' },
			{ id: 'B', text: 'It delivers current from the coil to the circuit.' },
			{ id: 'C', text: 'It ensures the coil rotates continuously in one direction.' },
			{ id: 'D', text: 'It ensures the external current changes direction.' }
		],
		correctAnswer: 'C',
		hint: "The commutator reverses the current in the coil every half-turn, allowing the magnetic force to continue pushing the coil in the same direction.",
		topic: "Electrodynamics"
	},
	{
		id: 1.10,
		question: "Which ONE of the following statements correctly describes the photoelectric effect?",
		options: [
			{ id: 'A', text: 'An electron absorbs a photon and emits light.' },
			{ id: 'B', text: 'An electron emits a photon when colliding with another electron.' },
			{ id: 'C', text: 'An electron absorbs a photon and is ejected from a metal surface.' },
			{ id: 'D', text: 'A photon is emitted when an electron moves to a higher energy level.' }
		],
		correctAnswer: 'C',
		hint: "The photoelectric effect is the process where light (photons) incident on a metal surface causes the emission of electrons.",
		topic: "Photoelectric Effect"
	}
];

export default function PhysicsQuiz() {
	const router = useRouter();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [score, setScore] = useState(0);
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);

	const currentQuestion = questions[currentQuestionIndex];

	const handleExplain = async () => {
		setIsExplaining(true);
		setAiExplanation(null);
		try {
			const explanation = await getExplanation('Physical Sciences', currentQuestion.question);
			setAiExplanation(explanation ?? "I'm sorry, I couldn't generate an explanation for this question.");
		} catch (error) {
			console.error('Failed to get AI explanation:', error);
			setAiExplanation("Sorry, I couldn't generate an explanation right now. Please check your internet connection and try again.");
		} finally {
			setIsExplaining(false);
		}
	};
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

	const handleCheckAnswer = () => {
		if (!selectedAnswer) return;

		const correct = selectedAnswer === currentQuestion.correctAnswer;
		setIsCorrect(correct);
		setShowResult(true);
		if (correct) setScore(score + 1);
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
			setSelectedAnswer(null);
			setShowResult(false);
			setAiExplanation(null);
		} else {
			router.push('/lesson-complete');
		}
	};

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend relative">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-4 mb-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.back()}
							className="rounded-full"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<div className="flex-1">
							<div className="flex justify-between items-center mb-2">
								<div className="flex items-center gap-2">
									<span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
										Question {currentQuestionIndex + 1} of {questions.length}
									</span>
									{score > 0 && (
										<Badge variant="outline" className="text-[10px] font-bold text-brand-green border-brand-green/20 bg-brand-green/5">
											Score: {score}
										</Badge>
									)}
								</div>
								<Badge
									variant="secondary"
									className="text-[10px] font-black uppercase tracking-tighter rounded-full bg-brand-purple/10 text-brand-purple"
								>
									{currentQuestion.topic}
								</Badge>
							</div>
							<Progress value={progress} className="h-2 rounded-full" />
						</div>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-8 space-y-8 pb-64 max-w-2xl mx-auto w-full">
					{/* Question */}
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<TrendingUp className="w-5 h-5 text-brand-purple" />
							<h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">NSC Physics P1 2025</h3>
						</div>
						<h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
							{currentQuestion.question}
						</h2>

						<Card className="p-8 bg-white dark:bg-zinc-900 border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
							<div className="absolute inset-0 bg-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />

							<RadioGroup
								value={selectedAnswer || ''}
								onValueChange={setSelectedAnswer}
								disabled={showResult}
								className="space-y-4 relative z-10"
							>
								{currentQuestion.options.map((option) => (
									<div key={option.id} className="flex items-center">
										<RadioGroupItem
											value={option.id}
											id={option.id}
											className="sr-only"
										/>
										<Label
											htmlFor={option.id}
											className={`flex-1 p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
												selectedAnswer === option.id
													? 'border-brand-purple bg-brand-purple/5 shadow-md scale-[1.02]'
													: 'border-zinc-100 dark:border-zinc-800 hover:border-brand-purple/30'
											} ${
												showResult && option.id === currentQuestion.correctAnswer
													? 'border-green-500 bg-green-500/10'
													: showResult && selectedAnswer === option.id && option.id !== currentQuestion.correctAnswer
													? 'border-red-500 bg-red-500/10'
													: ''
											}`}
										>
											<span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
												selectedAnswer === option.id
													? 'bg-brand-purple text-white'
													: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
											}`}>
												{option.id}
											</span>
											<span className="font-bold text-zinc-700 dark:text-zinc-300">
												{option.text}
											</span>
										</Label>
									</div>
								))}
							</RadioGroup>
						</Card>
					</div>

					{/* Feedback / Result */}
					{showResult && (
						<div className={`p-6 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-4 ${
							isCorrect
								? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
								: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
						}`}>
							<div className="flex items-start gap-4">
								<div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
									isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
								}`}>
									{isCorrect ? (
										<CheckCircle2 className="w-5 h-5 text-green-600" />
									) : (
										<SkipForward className="w-5 h-5 text-red-600" />
									)}
								</div>
								<div>
									<h4 className={`font-black text-xs uppercase tracking-widest mb-1 ${
										isCorrect ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
									}`}>
										{isCorrect ? 'Correct! Well done' : 'Not quite right'}
									</h4>
									<p className={`text-sm font-medium ${
										isCorrect ? 'text-green-800/80 dark:text-green-200/80' : 'text-red-800/80 dark:text-red-200/80'
									}`}>
										{isCorrect
											? "Excellent understanding of the physics principles involved."
											: `The correct answer is ${currentQuestion.correctAnswer}. Let's review the teacher's hint.`}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Hint */}
					<div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[2rem] flex items-start gap-4">
						<div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
							<Lightbulb className="w-5 h-5 text-amber-600" />
						</div>
						<div>
							<h4 className="font-black text-amber-900 dark:text-amber-100 text-xs uppercase tracking-widest mb-1">
								Teacher's Hint
							</h4>
							<p className="text-sm text-amber-800/80 dark:text-amber-200/80 font-medium">
								{currentQuestion.hint}
							</p>
						</div>
					</div>

					{/* AI Explanation Toggle */}
					<div className="p-1 bg-gradient-to-r from-brand-blue to-brand-purple rounded-[2rem]">
						<div className="bg-white dark:bg-zinc-950 rounded-[1.9rem] p-6 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
										<Sparkles className="w-5 h-5 text-brand-purple" />
									</div>
									<div>
										<h4 className="font-bold text-zinc-900 dark:text-white text-sm">Need a deeper explanation?</h4>
										<p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Ask MatricMaster AI</p>
									</div>
								</div>
								<Button
									size="sm"
									variant="ghost"
									className="font-black text-brand-purple hover:bg-brand-purple/5"
									onClick={handleExplain}
									disabled={isExplaining}
								>
									{isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explain'}
								</Button>
							</div>

							{aiExplanation && (
								<div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
									<p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap">
										{aiExplanation}
									</p>
								</div>
							)}
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Actions Footer */}
			<footer className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 z-30">
				<div className="max-w-2xl mx-auto w-full p-6 flex gap-4">
					{!showResult ? (
						<Button
							className="flex-1 h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-bold text-lg shadow-xl shadow-zinc-900/10 disabled:opacity-50 transition-all active:scale-95"
							disabled={!selectedAnswer}
							onClick={handleCheckAnswer}
						>
							Check Answer
						</Button>
					) : (
						<Button
							className="flex-1 h-16 bg-brand-purple text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all active:scale-95"
							onClick={handleNextQuestion}
						>
							{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
						</Button>
					)}
				</div>
			</footer>
		</div>
	);
}
