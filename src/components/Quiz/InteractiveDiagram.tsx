'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import {
	CircleDiagram,
	CircuitDiagram,
	DNADiagram,
	ForceDiagram,
	ParabolaDiagram,
	ProjectileDiagram,
	PunnettSquareDiagram,
	SynopticDiagram,
	TriangleDiagram,
	VectorDiagram,
	WaveDiagram,
} from './diagrams';

interface ExplorablePart {
	id: string;
	label: string;
	explanation: string;
	quiz: { question: string; options: string[]; answer: number }[];
}

interface DiagramPartMap {
	diagramType: string;
	parts: ExplorablePart[];
}

const DIAGRAM_PARTS: DiagramPartMap[] = [
	{
		diagramType: 'force',
		parts: [
			{
				id: 'weight',
				label: 'Weight (W)',
				explanation:
					'Weight is the gravitational force acting on an object, calculated as W = mg where m is mass and g is the acceleration due to gravity (9.8 m/s² on Earth).',
				quiz: [
					{
						question: 'What is the weight of a 5 kg object on Earth?',
						options: ['5 N', '49 N', '9.8 N', '50 kg'],
						answer: 1,
					},
					{
						question: 'Which formula correctly calculates weight?',
						options: ['W = mv', 'W = mg', 'W = ma', 'W = Fd'],
						answer: 1,
					},
					{
						question: 'If g = 9.8 m/s², what happens to weight if mass doubles?',
						options: ['Halves', 'Doubles', 'Stays the same', 'Quadruples'],
						answer: 1,
					},
				],
			},
			{
				id: 'applied',
				label: 'Applied force (F)',
				explanation:
					"An applied force is a force that is applied to an object by a person or another object. According to Newton's Second Law, F = ma.",
				quiz: [
					{
						question: "Newton's Second Law states that F equals:",
						options: ['mv', 'ma', 'mg', 'Fd'],
						answer: 1,
					},
					{
						question: 'If a 10 N force accelerates a 2 kg mass, what is the acceleration?',
						options: ['5 m/s²', '20 m/s²', '0.2 m/s²', '12 m/s²'],
						answer: 0,
					},
					{
						question: 'What is the SI unit of force?',
						options: ['Joule', 'Newton', 'Pascal', 'Watt'],
						answer: 1,
					},
				],
			},
		],
	},
	{
		diagramType: 'wave',
		parts: [
			{
				id: 'amplitude',
				label: 'Amplitude (A)',
				explanation:
					'Amplitude is the maximum displacement of a wave from its equilibrium position. It determines the energy of the wave — larger amplitude means more energy.',
				quiz: [
					{
						question: 'What does amplitude measure?',
						options: [
							'Wave speed',
							'Maximum displacement from rest',
							'Distance between crests',
							'Number of oscillations per second',
						],
						answer: 1,
					},
					{
						question: 'If amplitude increases, what happens to wave energy?',
						options: ['Decreases', 'Stays the same', 'Increases', 'Becomes zero'],
						answer: 2,
					},
					{
						question: 'Amplitude is measured in:',
						options: ['Hertz', 'Metres', 'Seconds', 'Newton'],
						answer: 1,
					},
				],
			},
			{
				id: 'wavelength',
				label: 'Wavelength (λ)',
				explanation:
					'Wavelength is the distance between two consecutive points in phase on a wave, such as crest to crest or trough to trough. It is measured in metres.',
				quiz: [
					{
						question: 'Wavelength is the distance between:',
						options: [
							'Any two points on a wave',
							'Two consecutive crests',
							'The start and end of a wave',
							'A crest and a trough',
						],
						answer: 1,
					},
					{
						question: 'What symbol represents wavelength?',
						options: ['f', 'T', 'λ', 'A'],
						answer: 2,
					},
					{
						question: 'The wave equation relating speed, frequency and wavelength is:',
						options: ['v = fλ', 'v = f/λ', 'v = λ/f', 'v = f²λ'],
						answer: 0,
					},
				],
			},
		],
	},
	{
		diagramType: 'circuit',
		parts: [
			{
				id: 'battery',
				label: 'Battery (emf)',
				explanation:
					'A battery provides the electromotive force (emf) that drives current through a circuit. The emf is measured in volts (V) and represents the energy per unit charge.',
				quiz: [
					{
						question: 'What does emf stand for?',
						options: [
							'Electromagnetic force',
							'Electromotive force',
							'Electronic magnetic field',
							'Energy multiplied by force',
						],
						answer: 1,
					},
					{
						question: 'Emf is measured in:',
						options: ['Amperes', 'Ohms', 'Volts', 'Watts'],
						answer: 2,
					},
					{
						question: 'In a circuit with internal resistance r, the terminal voltage equals:',
						options: ['V = emf + Ir', 'V = emf - Ir', 'V = I/emf', 'V = emf × r'],
						answer: 1,
					},
				],
			},
			{
				id: 'resistor',
				label: 'Resistor',
				explanation:
					"A resistor opposes the flow of current in a circuit. Ohm's Law states V = IR, where V is voltage, I is current, and R is resistance.",
				quiz: [
					{
						question: "Ohm's Law is expressed as:",
						options: ['V = IR', 'V = I/R', 'V = I + R', 'V = R/I'],
						answer: 0,
					},
					{
						question: 'Resistance is measured in:',
						options: ['Volts', 'Amperes', 'Ohms', 'Joules'],
						answer: 2,
					},
					{
						question: 'If V = 12 V and R = 4 Ω, what is the current?',
						options: ['48 A', '3 A', '0.33 A', '8 A'],
						answer: 1,
					},
				],
			},
		],
	},
	{
		diagramType: 'dna',
		parts: [
			{
				id: 'base-pair',
				label: 'Base pairs',
				explanation:
					'DNA base pairs follow the complementary rule: adenine (A) pairs with thymine (T), and cytosine (C) pairs with guanine (G). These are held together by hydrogen bonds.',
				quiz: [
					{
						question: 'Which base pairs with adenine?',
						options: ['Cytosine', 'Guanine', 'Thymine', 'Uracil'],
						answer: 2,
					},
					{
						question: 'How many hydrogen bonds form between A and T?',
						options: ['1', '2', '3', '4'],
						answer: 1,
					},
					{
						question: 'Which base pairs with cytosine?',
						options: ['Adenine', 'Thymine', 'Guanine', 'Uracil'],
						answer: 2,
					},
				],
			},
		],
	},
];

interface InteractiveDiagramProps {
	type: string;
	className?: string;
}

function ExplorablePanel({ part, onClose }: { part: ExplorablePart; onClose: () => void }) {
	const [mode, setMode] = useState<'explain' | 'quiz'>('explain');
	const [quizIndex, setQuizIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [correctCount, setCorrectCount] = useState(0);

	const handleAnswer = useCallback(
		(index: number) => {
			if (selectedAnswer !== null) return;
			setSelectedAnswer(index);
			if (part.quiz[quizIndex]?.answer === index) {
				setCorrectCount((c) => c + 1);
			}
		},
		[selectedAnswer, part, quizIndex]
	);

	return (
		<m.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			transition={{ duration: 0.2 }}
			className="mt-3 rounded-2xl border border-border/30 bg-card p-4 shadow-lg"
		>
			<div className="flex items-center justify-between mb-2">
				<h4 className="font-[family-name:var(--font-playfair)] text-sm font-bold">{part.label}</h4>
				<button
					type="button"
					onClick={onClose}
					className="text-muted-foreground hover:text-foreground text-xs"
				>
					Close
				</button>
			</div>

			{mode === 'explain' && (
				<div className="space-y-3">
					<p className="text-xs text-muted-foreground leading-relaxed">{part.explanation}</p>
					{part.quiz.length > 0 && (
						<button
							type="button"
							onClick={() => {
								setMode('quiz');
								setQuizIndex(0);
								setSelectedAnswer(null);
								setCorrectCount(0);
							}}
							className="text-xs text-primary hover:underline"
						>
							Quick quiz ({part.quiz.length} questions)
						</button>
					)}
				</div>
			)}

			{mode === 'quiz' && part.quiz[quizIndex] && (
				<div className="space-y-3">
					<div className="text-xs text-muted-foreground">
						Question {quizIndex + 1} of {part.quiz.length}
					</div>
					<p className="text-xs font-medium">{part.quiz[quizIndex].question}</p>
					<div className="space-y-1.5">
						{part.quiz[quizIndex].options.map((option, idx) => {
							const isCorrect = part.quiz[quizIndex].answer === idx;
							const isSelected = selectedAnswer === idx;
							return (
								<button
									key={idx}
									type="button"
									onClick={() => handleAnswer(idx)}
									disabled={selectedAnswer !== null}
									className={cn(
										'w-full text-left px-3 py-2 rounded-xl text-xs transition-colors border',
										selectedAnswer === null
											? 'border-border/30 hover:bg-secondary/50'
											: isCorrect
												? 'border-green-500/50 bg-green-500/10 text-green-700'
												: isSelected
													? 'border-destructive/50 bg-destructive/10 text-destructive'
													: 'border-border/30 opacity-50'
									)}
								>
									{option}
								</button>
							);
						})}
					</div>

					{selectedAnswer !== null && (
						<div className="flex items-center justify-between">
							<span className="text-[10px] text-muted-foreground">{correctCount} correct</span>
							{quizIndex < part.quiz.length - 1 ? (
								<button
									type="button"
									onClick={() => {
										setQuizIndex((i) => i + 1);
										setSelectedAnswer(null);
									}}
									className="text-xs text-primary hover:underline"
								>
									Next
								</button>
							) : (
								<span className="text-xs text-muted-foreground">Quiz complete</span>
							)}
						</div>
					)}
				</div>
			)}
		</m.div>
	);
}

export function InteractiveDiagram({ type, className }: InteractiveDiagramProps) {
	const [activePart, setActivePart] = useState<ExplorablePart | null>(null);
	const typeLower = type.toLowerCase();

	const partMap = DIAGRAM_PARTS.find((dp) => typeLower.includes(dp.diagramType));

	const handlePartClick = useCallback(
		(partId: string) => {
			const part = partMap?.parts.find((p) => p.id === partId);
			if (part) setActivePart(part);
		},
		[partMap]
	);

	const renderDiagram = () => {
		if (
			typeLower.includes('triangle') ||
			typeLower.includes('trigonometry') ||
			typeLower.includes('sine rule') ||
			typeLower.includes('cosine rule')
		) {
			return <TriangleDiagram className={className} />;
		}

		if (typeLower.includes('circle') || typeLower.includes('analytical geometry')) {
			return <CircleDiagram className={className} />;
		}

		if (
			typeLower.includes('vector') ||
			typeLower.includes('magnitude') ||
			typeLower.includes('angle between')
		) {
			return <VectorDiagram className={className} />;
		}

		if (typeLower.includes('projectile') || typeLower.includes('projectile motion')) {
			return <ProjectileDiagram className={className} />;
		}

		if (
			typeLower.includes('force') ||
			typeLower.includes('newton') ||
			typeLower.includes('free body') ||
			typeLower.includes("newton's second law")
		) {
			return <ForceDiagram className={className} />;
		}

		if (
			typeLower.includes('wave') ||
			typeLower.includes('transverse') ||
			typeLower.includes('longitudinal')
		) {
			return <WaveDiagram className={className} />;
		}

		if (typeLower.includes('parabola') || typeLower.includes('function')) {
			return <ParabolaDiagram className={className} />;
		}

		if (typeLower.includes('punnett') || typeLower.includes('genetic')) {
			return <PunnettSquareDiagram className={className} />;
		}

		if (typeLower.includes('circuit')) {
			return <CircuitDiagram className={className} />;
		}

		if (typeLower.includes('synoptic') || typeLower.includes('cyclone')) {
			return <SynopticDiagram className={className} />;
		}

		if (typeLower.includes('dna') || typeLower.includes('helix')) {
			return <DNADiagram className={className} />;
		}

		return <div className={cn('w-full aspect-video bg-secondary/30 rounded-xl', className)} />;
	};

	return (
		<div className="relative">
			{renderDiagram()}

			{partMap && (
				<div className="flex flex-wrap gap-1.5 mt-3">
					{partMap.parts.map((part) => (
						<m.button
							key={part.id}
							type="button"
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							onClick={() => handlePartClick(part.id)}
							className={cn(
								'px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors border',
								activePart?.id === part.id
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border/30 bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
							)}
						>
							{part.label}
						</m.button>
					))}
				</div>
			)}

			<AnimatePresence>
				{activePart && <ExplorablePanel part={activePart} onClose={() => setActivePart(null)} />}
			</AnimatePresence>
		</div>
	);
}
