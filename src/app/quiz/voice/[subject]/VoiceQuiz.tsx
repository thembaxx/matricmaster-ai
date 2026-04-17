'use client';

import {
	ArrowLeft01Icon,
	MicIcon,
	MicOffIcon,
	NextIcon,
	VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FocusContent } from '@/components/Layout/FocusContent';
import { TimelineSidebar } from '@/components/Layout/TimelineSidebar';
import { Button } from '@/components/ui/button';

interface VoiceQuizProps {
	subject: string;
	userId: string;
}

interface Question {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

const SAMPLE_QUESTIONS: Question[] = [
	{
		id: '1',
		question: 'What is the derivative of x squared?',
		options: ['x', '2x', '2', 'x squared'],
		correctAnswer: 1,
		topic: 'Calculus',
		difficulty: 'easy',
	},
	{
		id: '2',
		question: 'A triangle with all sides equal is called?',
		options: ['Isosceles', 'Scalene', 'Equilateral', 'Right'],
		correctAnswer: 2,
		topic: 'Euclidean Geometry',
		difficulty: 'easy',
	},
	{
		id: '3',
		question: 'The sum of angles in a triangle equals?',
		options: ['90 degrees', '180 degrees', '360 degrees', '270 degrees'],
		correctAnswer: 1,
		topic: 'Geometry',
		difficulty: 'easy',
	},
	{
		id: '4',
		question: 'Like electrical charges do what?',
		options: ['Attract', 'Repel', 'Have no effect', 'Combine'],
		correctAnswer: 1,
		topic: 'Electrostatics',
		difficulty: 'easy',
	},
	{
		id: '5',
		question: 'What happens when temperature increases in an exothermic reaction?',
		options: ['Shift right', 'Shift left', 'No change', 'Equal amounts'],
		correctAnswer: 1,
		topic: 'Chemical Equilibrium',
		difficulty: 'medium',
	},
];

type VoiceCommand = 'next' | 'repeat' | 'answer_a' | 'answer_b' | 'answer_c' | 'answer_d' | 'skip';

interface QuizState {
	questions: Question[];
	currentIndex: number;
	score: number;
	streak: number;
	isSpeaking: boolean;
	isListening: boolean;
	lastAnswer: 'correct' | 'incorrect' | null;
	showResult: boolean;
	isComplete: boolean;
}

export default function VoiceQuiz(_props: VoiceQuizProps) {
	const { subject: _subject, userId: _userId } = _props;
	void _subject;
	void _userId;
	const [state, setState] = useState<QuizState>({
		questions: SAMPLE_QUESTIONS,
		currentIndex: 0,
		score: 0,
		streak: 0,
		isSpeaking: false,
		isListening: false,
		lastAnswer: null,
		showResult: false,
		isComplete: false,
	});

	const speechRecognitionClass =
		typeof window !== 'undefined'
			? window.SpeechRecognition || window.webkitSpeechRecognition
			: null;
	const recognitionRef = useRef<InstanceType<typeof speechRecognitionClass> | null>(null);
	const synthRef = useRef<SpeechSynthesis | null>(null);
	const answerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const currentQuestion = state.questions[state.currentIndex];

	const initSpeech = useCallback(() => {
		if (typeof window === 'undefined') return;

		const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognitionClass) {
			console.warn('Speech API not supported');
			return;
		}

		recognitionRef.current = new SpeechRecognitionClass();
		recognitionRef.current.continuous = false;
		recognitionRef.current.interimResults = true;
		recognitionRef.current.lang = 'en-ZA';

		recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
			const results = event.results as unknown as Array<{ transcript: string }>;
			const transcript = Array.from(results)
				.map((r) => r.transcript)
				.join('')
				.toLowerCase();

			console.log('Heard:', transcript);

			if (transcript.includes('next')) {
				handleVoiceCommand('next');
			} else if (transcript.includes('repeat')) {
				handleVoiceCommand('repeat');
			} else if (transcript.includes('skip')) {
				handleVoiceCommand('skip');
			} else if (transcript.match(/answer [abcd]/)) {
				const option = transcript.match(/answer ([abcd])/)?.[1];
				if (option) {
					handleVoiceCommand(`answer_${option}` as VoiceCommand);
				}
			}
		};

		recognitionRef.current.onend = () => {
			setState((prev) => ({ ...prev, isListening: false }));
			if (state.isListening) {
				recognitionRef.current?.start();
			}
		};

		recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
			console.error('Speech recognition error:', event.error);
			setState((prev) => ({ ...prev, isListening: false }));
		};

		synthRef.current = window.speechSynthesis;
	}, [state.isListening]);

	const speak = useCallback((text: string) => {
		if (!synthRef.current) {
			synthRef.current = window.speechSynthesis;
		}

		synthRef.current?.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = 'en-ZA';
		utterance.rate = 0.9;
		utterance.pitch = 1;

		utterance.onstart = () => {
			setState((prev) => ({ ...prev, isSpeaking: true }));
		};

		utterance.onend = () => {
			setState((prev) => ({ ...prev, isSpeaking: false }));
		};

		utterance.onerror = () => {
			setState((prev) => ({ ...prev, isSpeaking: false }));
		};

		synthRef.current?.speak(utterance);
	}, []);

	const readQuestion = useCallback(() => {
		if (!currentQuestion) return;

		const text = `Question ${state.currentIndex + 1}. ${currentQuestion.question}. Option A: ${currentQuestion.options[0]}. Option B: ${currentQuestion.options[1]}. Option C: ${currentQuestion.options[2]}. Option D: ${currentQuestion.options[3]}.`;
		speak(text);
	}, [currentQuestion, state.currentIndex, speak]);

	const startListening = useCallback(() => {
		if (!recognitionRef.current) {
			initSpeech();
		}

		setState((prev) => ({ ...prev, isListening: true }));
		recognitionRef.current?.start();
	}, [initSpeech]);

	const stopListening = useCallback(() => {
		setState((prev) => ({ ...prev, isListening: false }));
		recognitionRef.current?.stop();
	}, []);

	const handleVoiceCommand = useCallback(
		(command: VoiceCommand) => {
			switch (command) {
				case 'next':
				case 'skip':
					if (state.currentIndex >= state.questions.length - 1) {
						setState((prev) => ({ ...prev, isComplete: true }));
					} else {
						setState((prev) => ({
							...prev,
							currentIndex: prev.currentIndex + 1,
							showResult: false,
							lastAnswer: null,
						}));
						readQuestion();
					}
					break;
				case 'repeat':
					readQuestion();
					break;
				case 'answer_a':
				case 'answer_b':
				case 'answer_c':
				case 'answer_d': {
					const optionIndex = { answer_a: 0, answer_b: 1, answer_c: 2, answer_d: 3 }[
						command.split('_')[1]
					] as number;
					submitAnswer(optionIndex);
					break;
				}
			}
		},
		[state.currentIndex, state.questions.length, readQuestion]
	);

	const submitAnswer = useCallback(
		(optionIndex: number) => {
			if (!currentQuestion || state.showResult) return;

			const isCorrect = optionIndex === currentQuestion.correctAnswer;

			setState((prev) => ({
				...prev,
				score: isCorrect ? prev.score + 10 : prev.score,
				streak: isCorrect ? prev.streak + 1 : 0,
				lastAnswer: isCorrect ? 'correct' : 'incorrect',
				showResult: true,
			}));

			speak(
				isCorrect
					? 'Correct!'
					: `Incorrect. The answer is ${currentQuestion.options[currentQuestion.correctAnswer]}.`
			);

			if (answerTimeoutRef.current) {
				clearTimeout(answerTimeoutRef.current);
			}

			answerTimeoutRef.current = setTimeout(() => {
				if (state.currentIndex >= state.questions.length - 1) {
					setState((prev) => ({ ...prev, isComplete: true }));
				} else {
					setState((prev) => ({
						...prev,
						currentIndex: prev.currentIndex + 1,
						showResult: false,
						lastAnswer: null,
					}));
					setTimeout(readQuestion, 1500);
				}
			}, 3000);
		},
		[
			currentQuestion,
			state.currentIndex,
			state.questions.length,
			state.showResult,
			speak,
			readQuestion,
		]
	);

	useEffect(() => {
		initSpeech();
		return () => {
			recognitionRef.current?.stop();
			synthRef.current?.cancel();
			if (answerTimeoutRef.current) {
				clearTimeout(answerTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (currentQuestion && !state.isComplete) {
			setTimeout(readQuestion, 500);
		}
	}, [state.currentIndex]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				if (state.isListening) {
					stopListening();
				} else {
					startListening();
				}
			} else if (e.key === 'n') {
				handleVoiceCommand('next');
			} else if (e.key === 'r') {
				handleVoiceCommand('repeat');
			} else if (e.key >= '1' && e.key <= '4') {
				submitAnswer(Number.parseInt(e.key, 10) - 1);
			}
		},
		[state.isListening, startListening, stopListening, handleVoiceCommand, submitAnswer]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const restartQuiz = useCallback(() => {
		setState({
			questions: SAMPLE_QUESTIONS,
			currentIndex: 0,
			score: 0,
			streak: 0,
			isSpeaking: false,
			isListening: false,
			lastAnswer: null,
			showResult: false,
			isComplete: false,
		});
		readQuestion();
	}, [readQuestion]);

	if (state.isComplete) {
		return (
			<div className="min-h-screen bg-background flex">
				<TimelineSidebar />
				<FocusContent>
					<div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8">
						<div className="text-8xl">🎉</div>
						<h1 className="text-4xl font-display font-bold">Quiz Complete!</h1>
						<div className="bg-muted/50 rounded-2xl p-8 space-y-4">
							<div className="text-6xl font-mono font-bold text-primary">{state.score}</div>
							<div className="text-muted-foreground">points earned</div>
						</div>
						<div className="flex justify-center gap-4">
							<Button asChild variant="outline" className="rounded-full">
								<Link href="/quiz">
									<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
									back to quizzes
								</Link>
							</Button>
							<Button onClick={restartQuiz} className="rounded-full">
								play again
							</Button>
						</div>
					</div>
				</FocusContent>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex">
			<TimelineSidebar />
			<FocusContent>
				<div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
					<div className="flex items-center justify-between">
						<Button asChild variant="ghost" size="sm" className="rounded-full">
							<Link href="/quiz">
								<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
								exit
							</Link>
						</Button>
						<div className="text-sm text-muted-foreground">
							Question {state.currentIndex + 1} of {state.questions.length}
						</div>
						<div className="font-mono font-bold">{state.score} pts</div>
					</div>

					<div className="bg-muted/30 rounded-xl p-6 space-y-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<HugeiconsIcon
								icon={state.isSpeaking ? MicIcon : state.isListening ? MicIcon : MicOffIcon}
								className={`h-4 w-4 ${
									state.isSpeaking
										? 'text-green-500 animate-pulse'
										: state.isListening
											? 'text-red-500 animate-pulse'
											: 'text-muted-foreground'
								}`}
							/>
							{state.isSpeaking
								? 'Speaking...'
								: state.isListening
									? 'Listening...'
									: 'Voice ready'}
						</div>

						<h2 className="text-xl font-medium leading-relaxed">{currentQuestion?.question}</h2>

						<div className="grid gap-3">
							{currentQuestion?.options.map((option, index) => (
								<button
									key={index}
									type="button"
									onClick={() => submitAnswer(index)}
									disabled={state.showResult}
									className={`p-4 rounded-xl text-left transition-all ${
										state.showResult
											? index === currentQuestion.correctAnswer
												? 'bg-green-500/20 border-2 border-green-500'
												: 'bg-muted/50 opacity-50'
											: 'bg-muted/50 hover:bg-muted hover:border-primary/50 border-2 border-transparent'
									}`}
								>
									<span className="font-mono font-bold mr-3">{['A', 'B', 'C', 'D'][index]}</span>
									{option}
								</button>
							))}
						</div>

						{state.lastAnswer && (
							<div
								className={`flex items-center gap-2 p-3 rounded-lg ${
									state.lastAnswer === 'correct'
										? 'bg-green-500/20 text-green-500'
										: 'bg-red-500/20 text-red-500'
								}`}
							>
								{state.lastAnswer === 'correct' ? (
									<CheckCircleIcon className="h-5 w-5" />
								) : (
									<XCircleIcon className="h-5 w-5" />
								)}
								{state.lastAnswer === 'correct' ? 'Correct!' : 'Incorrect'}
							</div>
						)}
					</div>

					<div className="flex justify-center gap-3">
						<Button
							onClick={() => handleVoiceCommand('repeat')}
							variant="outline"
							size="sm"
							className="rounded-full"
						>
							<HugeiconsIcon icon={VolumeHighIcon} className="mr-2 h-4 w-4" />
							repeat
						</Button>
						<Button
							onClick={state.isListening ? stopListening : startListening}
							variant={state.isListening ? 'destructive' : 'default'}
							size="sm"
							className="rounded-full"
						>
							<HugeiconsIcon
								icon={state.isListening ? MicOffIcon : MicIcon}
								className="mr-2 h-4 w-4"
							/>
							{state.isListening ? 'stop' : 'listen'}
						</Button>
						<Button
							onClick={() => handleVoiceCommand('next')}
							variant="outline"
							size="sm"
							className="rounded-full"
						>
							<HugeiconsIcon icon={NextIcon} className="mr-2 h-4 w-4" />
							next
						</Button>
					</div>

					<div className="text-center text-sm text-muted-foreground space-y-1">
						<p>Voice commands: "next", "repeat", "answer A/B/C/D", "skip"</p>
						<p>Or press Space to toggle voice, 1-4 to answer</p>
					</div>
				</div>
			</FocusContent>
		</div>
	);
}
