'use client';

import { ArrowLeft, CheckCircle2, TrendingUp, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SafeImage } from '@/components/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

// Physics questions data based on our seeded database
const physicsQuestions = [
	{
		id: 1,
		question:
			"The velocity-time graph of an object is a horizontal line above the time axis. What is the object's acceleration?",
		imageUrl: 'https://example.com/physics-diagram-1.png',
		gradeLevel: 9,
		topic: 'Kinematics',
		difficulty: 'medium',
		marks: 2,
		options: [
			{ id: 'A', text: 'Zero' },
			{ id: 'B', text: 'Constant and positive' },
			{ id: 'C', text: 'Constant and negative' },
			{ id: 'D', text: 'Increasing' },
		],
		correctAnswer: 'A',
		explanation:
			'A horizontal velocity-time graph indicates constant velocity, so acceleration (slope of the graph) is zero.',
	},
	{
		id: 2,
		question:
			'A book rests on a table. Which free-body diagram correctly represents the forces acting on the book?',
		imageUrl: 'https://example.com/physics-diagram-2.png',
		gradeLevel: 10,
		topic: 'Forces',
		difficulty: 'medium',
		marks: 2,
		options: [
			{ id: 'A', text: 'Only weight force downward' },
			{ id: 'B', text: 'Weight downward and normal force upward, equal in magnitude' },
			{ id: 'C', text: 'Weight downward, normal force upward, and a small friction force' },
			{ id: 'D', text: 'Only normal force upward' },
		],
		correctAnswer: 'B',
		explanation:
			"At rest, the normal force from the table balances the book's weight, resulting in zero net force.",
	},
	{
		id: 3,
		question:
			'A pendulum swings from point A (highest) to point B (lowest). Ignoring air resistance, what happens to its kinetic and potential energy?',
		imageUrl: 'https://example.com/physics-diagram-3.png',
		gradeLevel: 11,
		topic: 'Energy',
		difficulty: 'hard',
		marks: 3,
		options: [
			{ id: 'A', text: 'Kinetic energy increases, potential energy decreases' },
			{ id: 'B', text: 'Kinetic energy decreases, potential energy increases' },
			{ id: 'C', text: 'Both kinetic and potential energy increase' },
			{ id: 'D', text: 'Both kinetic and potential energy decrease' },
		],
		correctAnswer: 'A',
		explanation:
			'At the highest point (A), potential energy is maximum and kinetic energy is zero. As it swings down to B, potential energy converts to kinetic energy.',
	},
	{
		id: 4,
		question:
			'In a transverse wave, the direction of particle motion is __________ to the direction of wave propagation.',
		imageUrl: 'https://example.com/physics-diagram-4.png',
		gradeLevel: 10,
		topic: 'Waves',
		difficulty: 'medium',
		marks: 2,
		options: [
			{ id: 'A', text: 'Parallel' },
			{ id: 'B', text: 'Perpendicular' },
			{ id: 'C', text: 'At 45 degrees' },
			{ id: 'D', text: 'Opposite' },
		],
		correctAnswer: 'B',
		explanation:
			"In transverse waves (e.g., light), particles oscillate perpendicular to the wave's direction of travel.",
	},
	{
		id: 5,
		question:
			'In a series circuit with two identical bulbs, if one bulb burns out, what happens to the other bulb?',
		imageUrl: 'https://example.com/physics-diagram-5.png',
		gradeLevel: 9,
		topic: 'Electricity',
		difficulty: 'easy',
		marks: 2,
		options: [
			{ id: 'A', text: 'It remains lit' },
			{ id: 'B', text: 'It becomes brighter' },
			{ id: 'C', text: 'It goes out' },
			{ id: 'D', text: 'It flickers' },
		],
		correctAnswer: 'C',
		explanation:
			'Series circuits require continuous current flow; a burned-out bulb breaks the circuit, turning off both bulbs.',
	},
	{
		id: 6,
		question:
			'The magnetic field lines around a bar magnet emerge from the __________ pole and enter the __________ pole.',
		imageUrl: 'https://example.com/physics-diagram-6.png',
		gradeLevel: 11,
		topic: 'Magnetism',
		difficulty: 'medium',
		marks: 2,
		options: [
			{ id: 'A', text: 'North, South' },
			{ id: 'B', text: 'South, North' },
			{ id: 'C', text: 'North, North' },
			{ id: 'D', text: 'South, South' },
		],
		correctAnswer: 'A',
		explanation:
			'Magnetic field lines always flow from the north pole to the south pole outside the magnet.',
	},
	{
		id: 7,
		question:
			'When light reflects off a smooth surface, the angle of incidence is equal to the angle of __________.',
		imageUrl: 'https://example.com/physics-diagram-7.png',
		gradeLevel: 10,
		topic: 'Optics',
		difficulty: 'medium',
		marks: 2,
		options: [
			{ id: 'A', text: 'Refraction' },
			{ id: 'B', text: 'Reflection' },
			{ id: 'C', text: 'Diffraction' },
			{ id: 'D', text: 'Absorption' },
		],
		correctAnswer: 'B',
		explanation:
			'The law of reflection states that the angle of incidence equals the angle of reflection.',
	},
	{
		id: 8,
		question: 'Which method of heat transfer does NOT require a medium?',
		imageUrl: 'https://example.com/physics-diagram-8.png',
		gradeLevel: 9,
		topic: 'Thermodynamics',
		difficulty: 'easy',
		marks: 2,
		options: [
			{ id: 'A', text: 'Conduction' },
			{ id: 'B', text: 'Convection' },
			{ id: 'C', text: 'Radiation' },
			{ id: 'D', text: 'All require a medium' },
		],
		correctAnswer: 'C',
		explanation:
			'Radiation (e.g., sunlight) transfers heat via electromagnetic waves, which travel through vacuum.',
	},
	{
		id: 9,
		question:
			'Which type of radioactive decay involves the emission of an electron from the nucleus?',
		imageUrl: 'https://example.com/physics-diagram-9.png',
		gradeLevel: 12,
		topic: 'Nuclear Physics',
		difficulty: 'hard',
		marks: 3,
		options: [
			{ id: 'A', text: 'Alpha decay' },
			{ id: 'B', text: 'Beta decay' },
			{ id: 'C', text: 'Gamma decay' },
			{ id: 'D', text: 'Positron emission' },
		],
		correctAnswer: 'B',
		explanation:
			'Beta decay (β⁻) occurs when a neutron converts to a proton, emitting an electron and an antineutrino.',
	},
	{
		id: 10,
		question:
			'In projectile motion, the horizontal component of velocity __________ (ignoring air resistance).',
		imageUrl: 'https://example.com/physics-diagram-10.png',
		gradeLevel: 11,
		topic: 'Motion',
		difficulty: 'medium',
		marks: 2,
		options: [
			{ id: 'A', text: 'Increases' },
			{ id: 'B', text: 'Decreases' },
			{ id: 'C', text: 'Remains constant' },
			{ id: 'D', text: 'Becomes zero at the peak' },
		],
		correctAnswer: 'C',
		explanation:
			'Horizontal acceleration is zero, so horizontal velocity does not change during flight.',
	},
];

export default function TestQuizScreen() {
	const router = useRouter();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
	const [showResults, setShowResults] = useState(false);

	const currentQuestion = physicsQuestions[currentQuestionIndex];
	const progress = (currentQuestionIndex / physicsQuestions.length) * 100;

	const handleAnswerSelect = (value: string) => {
		setSelectedAnswers((prev) => ({
			...prev,
			[currentQuestion.id]: value,
		}));
	};

	const handleNext = () => {
		if (currentQuestionIndex < physicsQuestions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
		} else {
			setShowResults(true);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
		}
	};

	const calculateScore = () => {
		return physicsQuestions.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length;
	};

	const getGrade = (score: number) => {
		const percentage = (score / physicsQuestions.length) * 100;
		if (percentage >= 80) return 'A';
		if (percentage >= 70) return 'B';
		if (percentage >= 60) return 'C';
		if (percentage >= 50) return 'D';
		return 'F';
	};

	const score = calculateScore();
	const grade = getGrade(score);

	if (showResults) {
		return (
			<div className="flex flex-col h-full bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-6">
				<div className="flex items-center justify-between mb-8">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm"
					>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
						Test Results
					</h1>
					<div className="w-10" /> {/* Spacer */}
				</div>

				<Card className="flex-1 flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
					<div className="text-center mb-8">
						<TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-500" />
						<h2 className="text-3xl font-bold mb-2">Test Completed!</h2>
						<p className="text-zinc-600 dark:text-zinc-300">
							You scored {score} out of {physicsQuestions.length} questions
						</p>
					</div>

					<div className="grid grid-cols-2 gap-6 w-full max-w-md mb-8">
						<Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20">
							<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
								{score}/{physicsQuestions.length}
							</div>
							<div className="text-sm text-zinc-600 dark:text-zinc-300">Correct Answers</div>
						</Card>

						<Card className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">
							<div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{grade}</div>
							<div className="text-sm text-zinc-600 dark:text-zinc-300">Grade</div>
						</Card>
					</div>

					<div className="w-full max-w-md space-y-3">
						{physicsQuestions.map((question, index) => {
							const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
							return (
								<div
									key={question.id}
									className={`p-3 rounded-lg flex items-center justify-between ${
										isCorrect
											? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
											: 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
									}`}
								>
									<span className="font-medium">Question {index + 1}</span>
									{isCorrect ? (
										<CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
									) : (
										<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
									)}
								</div>
							);
						})}
					</div>

					<div className="flex gap-4 mt-8">
						<Button
							variant="outline"
							onClick={() => {
								setShowResults(false);
								setCurrentQuestionIndex(0);
								setSelectedAnswers({});
							}}
						>
							Retry Test
						</Button>
						<Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-6">
			<div className="flex items-center justify-between mb-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm"
				>
					<ArrowLeft className="w-5 h-5" />
				</Button>

				<div className="text-center">
					<h1 className="text-xl font-bold text-zinc-900 dark:text-white">Physics Test</h1>
					<p className="text-sm text-zinc-600 dark:text-zinc-300">
						Question {currentQuestionIndex + 1} of {physicsQuestions.length}
					</p>
				</div>

				<Badge variant="secondary" className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
					Grade {currentQuestion.gradeLevel}
				</Badge>
			</div>

			<Card className="flex-1 flex flex-col bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm mb-6">
				<ScrollArea className="flex-1 p-6">
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-3">
							<Badge
								variant="outline"
								className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
							>
								{currentQuestion.topic}
							</Badge>
							<Badge
								variant="outline"
								className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
							>
								{currentQuestion.difficulty}
							</Badge>
							<Badge
								variant="outline"
								className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
							>
								{currentQuestion.marks} marks
							</Badge>
						</div>

						<h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
							{currentQuestion.question}
						</h2>

						{currentQuestion.imageUrl && (
							<div className="mb-4 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
								<SafeImage
									src={currentQuestion.imageUrl}
									alt="Physics diagram"
									className="w-full h-48 object-contain"
								/>
							</div>
						)}
					</div>

					<RadioGroup
						value={selectedAnswers[currentQuestion.id] || ''}
						onValueChange={handleAnswerSelect}
						className="space-y-4"
					>
						{currentQuestion.options.map((option) => (
							<div key={option.id} className="flex items-start space-x-3">
								<RadioGroupItem
									value={option.id}
									id={option.id}
									className="mt-1 border-2 border-zinc-300 dark:border-zinc-600 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
								/>
								<Label
									htmlFor={option.id}
									className="flex-1 text-base font-medium leading-relaxed cursor-pointer text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
								>
									{option.text}
								</Label>
							</div>
						))}
					</RadioGroup>
				</ScrollArea>

				<div className="p-6 border-t border-zinc-200 dark:border-zinc-700">
					<div className="flex items-center justify-between gap-4">
						<Button
							variant="outline"
							onClick={handlePrevious}
							disabled={currentQuestionIndex === 0}
							className="flex-1"
						>
							Previous
						</Button>

						{selectedAnswers[currentQuestion.id] && (
							<Button
								onClick={handleNext}
								className="flex-1 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
							>
								{currentQuestionIndex === physicsQuestions.length - 1 ? 'Finish Test' : 'Next'}
							</Button>
						)}
					</div>
				</div>
			</Card>

			<div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full p-4">
				<Progress value={progress} className="h-2" />
				<div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mt-2">
					<span>Progress</span>
					<span>{Math.round(progress)}%</span>
				</div>
			</div>
		</div>
	);
}
