'use client';

import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AIExplanationCard } from '@/components/AI/AIExplanationCard';
import {
	MobileQuizFooter,
	QuizHintCard,
	QuizQuestionCard,
	QuizResultFeedback,
} from '@/components/Quiz';
import { Button } from '@/components/ui/button';
import { getExplanation } from '@/services/geminiService';
import { useQuizResultStore } from '@/stores/useQuizResultStore';

const questions = [
	{
		id: 1.1,
		question:
			'Three forces act on an object so that the resultant force is zero. Which ONE of the following vector diagrams is the CORRECT representation of the three forces?',
		options: [
			{ id: 'A', text: 'Forces forming a closed triangle (tip-to-tail)' },
			{ id: 'B', text: 'Forces pointing in the same direction' },
			{ id: 'C', text: 'Two forces in one direction, one in the opposite' },
			{ id: 'D', text: 'Forces that do not meet at the ends' },
		],
		correctAnswer: 'A',
		hint: 'For the resultant force to be zero, the vector sum must be zero.',
		topic: "Newton's Laws",
	},
	{
		id: 1.2,
		question:
			'Two large objects P and R, each of mass m, are placed r metres apart. They exert a gravitational force F on each other. If the mass of R is increased to 2m and the distance is increased to 2r, what is the new force?',
		options: [
			{ id: 'A', text: '1/2 F' },
			{ id: 'B', text: 'F' },
			{ id: 'C', text: '2 F' },
			{ id: 'D', text: '4 F' },
		],
		correctAnswer: 'A',
		hint: "Newton's Law: F = G*m1*m2/r². Doubling mass and distance results in 2/4 = 1/2 of original.",
		topic: 'Universal Gravitation',
	},
	{
		id: 1.3,
		question:
			'A ball is projected vertically upwards from the top of a building. Which point on a velocity-time graph corresponds to the greatest height above the ground?',
		options: [
			{ id: 'A', text: 'Point P (Initial velocity)' },
			{ id: 'B', text: 'Point Q (Where velocity is 0)' },
			{ id: 'C', text: 'Point R (On the way down)' },
			{ id: 'D', text: 'Point S (Impact)' },
		],
		correctAnswer: 'B',
		hint: 'At the peak, vertical velocity is exactly zero.',
		topic: 'Vertical Projectile Motion',
	},
	{
		id: 1.4,
		question:
			'Two hard objects collide INELASTICALLY in an isolated system. Which statement is CORRECT?',
		options: [
			{ id: 'A', text: 'Both momentum and kinetic energy are conserved.' },
			{ id: 'B', text: 'Neither is conserved.' },
			{ id: 'C', text: 'Only kinetic energy is conserved.' },
			{ id: 'D', text: 'Only momentum is conserved.' },
		],
		correctAnswer: 'D',
		hint: 'Momentum is always conserved. Inelastic collisions lose kinetic energy.',
		topic: 'Momentum & Impulse',
	},
	{
		id: 1.5,
		question:
			'Engine P has greater maximum power than engine Q. Which statement is CORRECT at maximum power?',
		options: [
			{ id: 'A', text: 'Q does more work in the same time.' },
			{ id: 'B', text: 'P and Q do the same work in the same time.' },
			{ id: 'C', text: 'P and Q do the same work, but Q is faster.' },
			{ id: 'D', text: 'P and Q do the same work, but P is faster.' },
		],
		correctAnswer: 'D',
		hint: 'Power = Work / Time. Higher power = same work in less time.',
		topic: 'Work, Energy & Power',
	},
	{
		id: 1.6,
		question:
			'Star B spectral lines are more red-shifted than star A. How do frequencies and speeds compare?',
		options: [
			{ id: 'A', text: 'B has higher frequency and greater speed' },
			{ id: 'B', text: 'B has higher frequency and smaller speed' },
			{ id: 'C', text: 'B has lower frequency and greater speed' },
			{ id: 'D', text: 'B has lower frequency and smaller speed' },
		],
		correctAnswer: 'C',
		hint: 'Red-shift = moving away (lower frequency). Larger red-shift = greater speed away.',
		topic: 'Doppler Effect',
	},
	{
		id: 1.7,
		question:
			'Point P is to the right of sphere S. ER and ES are electric fields at P due to spheres R and S. If both point right, what are the charges?',
		options: [
			{ id: 'A', text: 'R is Positive, S is Negative' },
			{ id: 'B', text: 'R is Negative, S is Positive' },
			{ id: 'C', text: 'R is Negative, S is Negative' },
			{ id: 'D', text: 'R is Positive, S is Positive' },
		],
		correctAnswer: 'D',
		hint: 'Electric field lines point away from positive charges.',
		topic: 'Electrostatics',
	},
	{
		id: 1.8,
		question:
			'In a circuit with internal resistance, Graph K has negative slope (V vs I) and Graph L has positive slope. Which voltmeters?',
		options: [
			{ id: 'A', text: 'K: V1 (Terminal), L: V1' },
			{ id: 'B', text: 'K: V1 (Terminal), L: V2 (External)' },
			{ id: 'C', text: 'K: V2 (External), L: V1 (Terminal)' },
			{ id: 'D', text: 'K: V2, L: V2' },
		],
		correctAnswer: 'B',
		hint: 'Terminal voltage decreases with current (V = ε - Ir). Resistor voltage increases (V = IR).',
		topic: 'Electric Circuits',
	},
	{
		id: 1.9,
		question: 'What is the function of the split-ring commutator in an electric motor?',
		options: [
			{ id: 'A', text: 'It rotates the coil directly.' },
			{ id: 'B', text: 'It delivers current from the coil to the circuit.' },
			{ id: 'C', text: 'It ensures continuous rotation in one direction.' },
			{ id: 'D', text: 'It ensures external current changes direction.' },
		],
		correctAnswer: 'C',
		hint: 'The commutator reverses current every half-turn for continuous rotation.',
		topic: 'Electrodynamics',
	},
	{
		id: 1.1,
		question: 'Which statement correctly describes the photoelectric effect?',
		options: [
			{ id: 'A', text: 'An electron absorbs a photon and emits light.' },
			{ id: 'B', text: 'An electron emits a photon when colliding with another electron.' },
			{ id: 'C', text: 'An electron absorbs a photon and is ejected from a metal surface.' },
			{ id: 'D', text: 'A photon is emitted when an electron moves to a higher energy level.' },
		],
		correctAnswer: 'C',
		hint: 'Photoelectric effect: light causes electron emission from metals.',
		topic: 'Photoelectric Effect',
	},
];

const COLORS = {
	bg: 'bg-brand-purple',
	text: 'text-brand-purple',
	border: 'border-brand-purple',
	bgSoft: 'bg-brand-purple/5',
	borderSoft: 'hover:border-brand-purple/30',
	shadow: 'shadow-brand-purple/20',
};

export default function PhysicsQuiz() {
	const router = useRouter();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [score, setScore] = useState(0);
	const [aiExplanation, setAiExplanation] = useState<string | null>(null);
	const [isExplaining, setIsExplaining] = useState(false);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const startTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const currentQuestion = questions[currentQuestionIndex];
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

	const handleExplain = async () => {
		setIsExplaining(true);
		setAiExplanation(null);
		try {
			const explanation = await getExplanation('Physical Sciences', currentQuestion.question);
			setAiExplanation(explanation ?? "I'm sorry, I couldn't generate an explanation.");
		} catch (error) {
			console.error('Failed to get AI explanation:', error);
			setAiExplanation("Sorry, I couldn't generate an explanation right now.");
		} finally {
			setIsExplaining(false);
		}
	};

	const handleCheckAnswer = () => {
		if (!selectedAnswer) return;
		const correct = selectedAnswer === currentQuestion.correctAnswer;
		setIsCorrect(correct);
		setShowResult(true);
		if (correct) setScore((prev) => prev + 1);
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setSelectedAnswer(null);
			setShowResult(false);
			setAiExplanation(null);
		} else {
			const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
			useQuizResultStore.getState().save({
				correctAnswers: score,
				totalQuestions: questions.length,
				durationSeconds,
				accuracy: Math.round((score / questions.length) * 100),
				subjectName: 'Physical Sciences',
				subjectId: 1,
				difficulty: 'medium',
				completedAt: new Date(),
			});
			router.push('/lesson-complete');
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className="fixed inset-0 flex flex-col w-full min-w-0 bg-background overflow-hidden">
			<header className="px-6 pt-12 pb-4 bg-background/80 backdrop-blur-xl sticky top-0 z-20 border-b border-border shrink-0">
				<div className="max-w-2xl mx-auto w-full flex items-center gap-4 mb-4">
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
							<span className="text-sm font-bold text-muted-foreground">
								Question {currentQuestionIndex + 1} of {questions.length}
							</span>
							<div className="flex items-center gap-2">
								{score > 0 && (
									<span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
										Score: {score}
									</span>
								)}
								<span className="text-xs text-muted-foreground">{formatTime(elapsedSeconds)}</span>
							</div>
						</div>
						<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full bg-brand-purple transition-all"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<span className="text-[10px] font-bold text-brand-purple mt-1 block">
							{currentQuestion.topic}
						</span>
					</div>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto w-full scroll-smooth">
				<main className="px-6 py-8 space-y-8 mobile-safe-bottom max-w-2xl mx-auto w-full">
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<TrendingUp className="w-5 h-5 text-brand-purple" />
							<h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
								NSC Physics P1 2025
							</h3>
						</div>
						<h2 className="text-2xl font-black text-foreground leading-tight">
							{currentQuestion.question}
						</h2>

						<QuizQuestionCard
							options={currentQuestion.options}
							selectedAnswer={selectedAnswer}
							correctAnswer={currentQuestion.correctAnswer}
							showResult={showResult}
							colors={COLORS}
							onSelect={setSelectedAnswer}
						/>
					</div>

					<QuizResultFeedback
						showResult={showResult}
						isCorrect={isCorrect}
						correctAnswer={currentQuestion.correctAnswer}
						correctMessage="Excellent understanding of the physics principles involved."
					/>

					<QuizHintCard hint={currentQuestion.hint} />

					<AIExplanationCard
						explanation={aiExplanation}
						isLoading={isExplaining}
						onExplain={handleExplain}
						subject="Physical Sciences"
					/>
				</main>
			</div>

			<MobileQuizFooter
				showCheckButton={!showResult}
				selectedAnswer={selectedAnswer}
				hasMoreQuestions={currentQuestionIndex < questions.length - 1}
				primaryColor="bg-brand-purple text-white"
				shadowColor="shadow-brand-purple/20"
				onCheck={handleCheckAnswer}
				onNext={handleNextQuestion}
			/>
		</div>
	);
}
