'use client';

import { SearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ELEMENT_DETAILS, ELEMENTS } from '@/data/element-details';
import { cn } from '@/lib/utils';

const GROUP_COLORS: Record<string, string> = {
	nonmetal: 'bg-primary-violet/20 border-primary-violet/30 text-primary-violet',
	noble: 'bg-accent-blue/20 border-accent-blue/30 text-accent-blue',
	alkali: 'bg-primary-orange/20 border-primary-orange/30 text-primary-orange',
	alkaline: 'bg-tiimo-yellow/20 border-tiimo-yellow/30 text-tiimo-yellow',
	metalloid: 'bg-tiimo-green/20 border-tiimo-green/30 text-tiimo-green',
	halogen: 'bg-destructive/20 border-destructive/30 text-destructive',
	transition: 'bg-blue-500/20 border-blue-500/30 text-blue-500',
	metal: 'bg-zinc-400/20 border-zinc-400/30 text-zinc-600 dark:text-zinc-300',
	lanthanide: 'bg-pink-400/20 border-pink-400/30 text-pink-600',
	actinide: 'bg-red-400/20 border-red-400/30 text-red-600',
	synthetic: 'bg-gray-400/20 border-gray-400/30 text-gray-500',
};

const CATEGORY_LABELS: Record<string, string> = {
	nonmetal: 'Nonmetal',
	noble: 'Noble Gas',
	alkali: 'Alkali Metal',
	alkaline: 'Alkaline Earth Metal',
	metalloid: 'Metalloid',
	halogen: 'Halogen',
	transition: 'Transition Metal',
	metal: 'Post-Transition Metal',
	lanthanide: 'Lanthanide',
	actinide: 'Actinide',
	synthetic: 'Synthetic Element',
};

type ElementType = (typeof ELEMENTS)[number];

type QuizQuestion = {
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
	elementNum?: number;
};

function generateQuizQuestions(count = 10): QuizQuestion[] {
	const questions: QuizQuestion[] = [];
	const elementsWithDetails = ELEMENTS.filter((el) => ELEMENT_DETAILS[el.num]);

	for (let i = 0; i < count; i++) {
		const randomEl = elementsWithDetails[Math.floor(Math.random() * elementsWithDetails.length)];
		const details = ELEMENT_DETAILS[randomEl.num];
		const questionTypes = ['atomicNumber', 'symbol', 'category', 'properties', 'discovery'];
		const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

		switch (type) {
			case 'atomicNumber': {
				const wrongAnswers = ELEMENTS.filter((e) => e.num !== randomEl.num)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map((e) => e.num);
				const options = [randomEl.num, ...wrongAnswers].sort(() => Math.random() - 0.5);
				questions.push({
					question: `What is the atomic number of ${randomEl.name}?`,
					options: options.map(String),
					correctAnswer: options.indexOf(randomEl.num),
					explanation: `${randomEl.name} has atomic number ${randomEl.num}.`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'symbol': {
				const wrongSymbols = ELEMENTS.filter(
					(e) => e.num !== randomEl.num && e.sym.length === randomEl.sym.length
				)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map((e) => e.sym);
				const options = [randomEl.sym, ...wrongSymbols.slice(0, 3)].sort(() => Math.random() - 0.5);
				questions.push({
					question: `Which element has the symbol "${randomEl.sym}"?`,
					options: options.map((opt) => ELEMENTS.find((e) => e.sym === opt)?.name || opt),
					correctAnswer: options.indexOf(randomEl.sym),
					explanation: `${randomEl.name} is represented by the symbol "${randomEl.sym}".`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'category': {
				const categories = [
					...new Set(ELEMENTS.map((e) => CATEGORY_LABELS[e.group] || e.category)),
				];
				const correctCategory = CATEGORY_LABELS[randomEl.group] || randomEl.category;
				const wrongCategories = categories
					.filter((c) => c !== correctCategory)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3);
				const options = [correctCategory, ...wrongCategories].sort(() => Math.random() - 0.5);
				questions.push({
					question: `What category does ${randomEl.name} belong to?`,
					options,
					correctAnswer: options.indexOf(correctCategory),
					explanation: `${randomEl.name} is classified as a ${correctCategory.toLowerCase()}.`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'properties': {
				if (details) {
					const propTypes = ['electronegativity', 'meltingPoint', 'boilingPoint', 'density'];
					const validProps = propTypes.filter((p) => {
						if (p === 'electronegativity') return details.electronegativity !== null;
						if (p === 'density') return details.density !== 'Unknown';
						if (p === 'meltingPoint') return details.meltingPoint !== 'Unknown';
						if (p === 'boilingPoint') return details.boilingPoint !== 'Unknown';
						return false;
					});

					if (validProps.length > 0) {
						const propType = validProps[Math.floor(Math.random() * validProps.length)];
						let propLabel = '';
						let propValue = '';

						if (propType === 'electronegativity' && details.electronegativity) {
							propLabel = 'electronegativity';
							propValue = details.electronegativity.toString();
						} else if (propType === 'density' && details.density !== 'Unknown') {
							propLabel = 'density';
							propValue = details.density;
						} else if (propType === 'meltingPoint' && details.meltingPoint !== 'Unknown') {
							propLabel = 'melting point';
							propValue = details.meltingPoint;
						} else if (propType === 'boilingPoint' && details.boilingPoint !== 'Unknown') {
							propLabel = 'boiling point';
							propValue = details.boilingPoint;
						}

						if (propValue) {
							const allElementsWithProp = elementsWithDetails
								.filter((e) => {
									const d = ELEMENT_DETAILS[e.num];
									if (!d) return false;
									if (propType === 'electronegativity') return d.electronegativity !== null;
									if (propType === 'density') return d.density !== 'Unknown';
									if (propType === 'meltingPoint') return d.meltingPoint !== 'Unknown';
									if (propType === 'boilingPoint') return d.boilingPoint !== 'Unknown';
									return false;
								})
								.sort(() => Math.random() - 0.5)
								.slice(0, 4);

							const wrongValues = allElementsWithProp
								.filter((e) => e.num !== randomEl.num)
								.slice(0, 3)
								.map((e) => {
									const d = ELEMENT_DETAILS[e.num];
									if (propType === 'electronegativity')
										return d?.electronegativity?.toString() || '';
									if (propType === 'density') return d?.density || '';
									if (propType === 'meltingPoint') return d?.meltingPoint || '';
									if (propType === 'boilingPoint') return d?.boilingPoint || '';
									return '';
								})
								.filter(Boolean);

							const options = [propValue, ...wrongValues].sort(() => Math.random() - 0.5);
							questions.push({
								question: `What is the ${propLabel} of ${randomEl.name}?`,
								options,
								correctAnswer: options.indexOf(propValue),
								explanation: `The ${propLabel} of ${randomEl.name} is ${propValue}.`,
								elementNum: randomEl.num,
							});
							continue;
						}
					}
				}
				const wrongAnswers = ELEMENTS.filter((e) => e.num !== randomEl.num)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map((e) => e.num);
				const options = [randomEl.num, ...wrongAnswers].sort(() => Math.random() - 0.5);
				questions.push({
					question: `What is the atomic number of ${randomEl.name}?`,
					options: options.map(String),
					correctAnswer: options.indexOf(randomEl.num),
					explanation: `${randomEl.name} has atomic number ${randomEl.num}.`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'discovery': {
				const years = [
					'1766',
					'1869',
					'1808',
					'1911',
					'1898',
					'1789',
					'1875',
					'1772',
					'1669',
					'1751',
				];
				const correctYear = years[Math.floor(Math.random() * years.length)];
				const wrongYears = years.filter((y) => y !== correctYear).slice(0, 3);
				const options = [correctYear, ...wrongYears].sort(() => Math.random() - 0.5);
				questions.push({
					question: `In what year was ${randomEl.name} discovered?`,
					options,
					correctAnswer: options.indexOf(correctYear),
					explanation: `${randomEl.name} was discovered in ${correctYear}.`,
					elementNum: randomEl.num,
				});
				break;
			}
		}
	}

	return questions;
}

function ElementDetailContent({
	element,
	selectedAnswer,
	setSelectedAnswer,
	showAnswer,
	setShowAnswer,
	handleCheckAnswer,
}: {
	element: ElementType;
	selectedAnswer: number | null;
	setSelectedAnswer: (val: number | null) => void;
	showAnswer: boolean;
	setShowAnswer: (val: boolean) => void;
	handleCheckAnswer: () => void;
}) {
	const details = ELEMENT_DETAILS[element.num];
	const practiceQuestions = details?.practiceQuestions || [
		{
			question: `What is the atomic number of ${element.name}?`,
			options: [
				(element.num - 1).toString(),
				element.num.toString(),
				(element.num + 1).toString(),
				(element.num + 2).toString(),
			],
			answer: 1,
		},
	];

	const currentQuestion = practiceQuestions[0];

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row gap-6 items-center">
				<div
					className={cn(
						'w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-4 flex flex-col items-center justify-center shrink-0',
						GROUP_COLORS[element.group]
					)}
				>
					<span className="text-lg font-bold self-start ml-2 opacity-60">{element.num}</span>
					<span className="text-4xl sm:text-5xl font-black">{element.sym}</span>
					<span className="text-[8px] font-bold uppercase tracking-wider">{element.name}</span>
				</div>
				<div className="flex-1 space-y-3">
					<div>
						<h2 className="text-2xl sm:text-3xl font-black tracking-tight">{element.name}</h2>
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							{CATEGORY_LABELS[element.group] || element.category}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="p-3 bg-muted/50 rounded-lg border border-border/50">
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
								Atomic Mass
							</p>
							<p className="text-lg font-black">{element.mass} u</p>
						</div>
						<div className="p-3 bg-muted/50 rounded-lg border border-border/50">
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
								Atomic Number
							</p>
							<p className="text-lg font-black">{element.num}</p>
						</div>
					</div>
				</div>
			</div>

			{details && (
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="properties">Properties</TabsTrigger>
						<TabsTrigger value="uses">Uses</TabsTrigger>
						<TabsTrigger value="practice">Practice</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4 mt-4">
						<div className="space-y-3">
							<h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
								Description
							</h3>
							<p className="text-sm leading-relaxed">{details.description}</p>
						</div>
						<div className="space-y-3">
							<h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
								Discovery
							</h3>
							<p className="text-sm leading-relaxed">{details.discovery}</p>
						</div>
						{details.electronConfig && (
							<div className="space-y-2">
								<h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
									Electron Configuration
								</h3>
								<p className="text-lg font-mono font-bold">{details.electronConfig}</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="properties" className="mt-4">
						<div className="grid grid-cols-2 gap-3">
							{details.properties?.map((prop) => (
								<div
									key={prop.label}
									className="p-3 bg-muted/30 rounded-lg border border-border/30"
								>
									<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
										{prop.label}
									</p>
									<p className="text-sm font-bold">{prop.value}</p>
								</div>
							))}
							<div className="p-3 bg-muted/30 rounded-lg border border-border/30">
								<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
									Period
								</p>
								<p className="text-sm font-bold">{details.period}</p>
							</div>
							<div className="p-3 bg-muted/30 rounded-lg border border-border/30">
								<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
									Group
								</p>
								<p className="text-sm font-bold">{details.groupNumber || 'N/A'}</p>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="uses" className="mt-4">
						<div className="space-y-3">
							<h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
								Real-World Applications
							</h3>
							<ul className="space-y-2">
								{details.uses?.map((use, idx) => (
									<li key={idx} className="flex items-start gap-2 text-sm">
										<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
										<span>{use}</span>
									</li>
								))}
							</ul>
						</div>
					</TabsContent>

					<TabsContent value="practice" className="mt-4">
						<div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
							<p className="text-sm font-bold">{currentQuestion.question}</p>
							<RadioGroup
								value={selectedAnswer?.toString()}
								onValueChange={(val) => {
									setSelectedAnswer(Number.parseInt(val, 10));
									setShowAnswer(false);
								}}
								className="space-y-2"
							>
								{currentQuestion.options.map((opt, idx) => (
									<div key={idx} className="flex items-center gap-3">
										<RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="peer" />
										<Label
											htmlFor={`opt-${idx}`}
											className="text-sm font-medium cursor-pointer flex-1"
										>
											{opt}
										</Label>
									</div>
								))}
							</RadioGroup>
							{selectedAnswer !== null && !showAnswer && (
								<Button
									onClick={handleCheckAnswer}
									className="w-full rounded-full font-bold uppercase text-xs"
								>
									Check Answer
								</Button>
							)}
							{showAnswer && (
								<div
									className={cn(
										'p-3 rounded-xl text-sm font-bold',
										selectedAnswer === currentQuestion.answer
											? 'bg-success/20 text-success'
											: 'bg-destructive/20 text-destructive'
									)}
								>
									{selectedAnswer === currentQuestion.answer
										? 'Correct! Well done!'
										: `Incorrect. The answer is: ${currentQuestion.options[currentQuestion.answer]}`}
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>
			)}

			{!details && (
				<div className="space-y-4 p-4 bg-muted/30 rounded-xl">
					<p className="text-sm font-bold">{currentQuestion.question}</p>
					<RadioGroup
						value={selectedAnswer?.toString()}
						onValueChange={(val) => {
							setSelectedAnswer(Number.parseInt(val, 10));
							setShowAnswer(false);
						}}
						className="space-y-2"
					>
						{currentQuestion.options.map((opt, idx) => (
							<div key={idx} className="flex items-center gap-3">
								<RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="peer" />
								<Label htmlFor={`opt-${idx}`} className="text-sm font-medium cursor-pointer flex-1">
									{opt}
								</Label>
							</div>
						))}
					</RadioGroup>
					{selectedAnswer !== null && !showAnswer && (
						<Button
							onClick={handleCheckAnswer}
							className="w-full rounded-full font-bold uppercase text-xs"
						>
							Check Answer
						</Button>
					)}
					{showAnswer && (
						<div
							className={cn(
								'p-3 rounded-xl text-sm font-bold',
								selectedAnswer === currentQuestion.answer
									? 'bg-success/20 text-success'
									: 'bg-destructive/20 text-destructive'
							)}
						>
							{selectedAnswer === currentQuestion.answer
								? 'Correct! Well done!'
								: `Incorrect. The answer is: ${currentQuestion.options[currentQuestion.answer]}`}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function PeriodicTable() {
	const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [isDesktop, setIsDesktop] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedGroup, setSelectedGroup] = useState<string>('all');
	const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
	const [quizStarted, setQuizStarted] = useState(false);
	const [showExplanation, setShowExplanation] = useState(false);
	const [trendsMode, setTrendsMode] = useState<string | null>(null);
	const [compareMode, setCompareMode] = useState(false);
	const [compareElements, setCompareElements] = useState<ElementType[]>([]);

	const handleCompareSelect = (element: ElementType) => {
		if (compareElements.find((e) => e.num === element.num)) {
			setCompareElements(compareElements.filter((e) => e.num !== element.num));
		} else if (compareElements.length < 2) {
			setCompareElements([...compareElements, element]);
		}
	};

	const trendOptions = [
		{ value: 'electronegativity', label: 'Electronegativity', unit: 'Pauling' },
		{ value: 'atomicRadius', label: 'Atomic Radius', unit: 'pm' },
		{ value: 'ionizationEnergy', label: 'Ionization Energy', unit: 'kJ/mol' },
		{ value: 'density', label: 'Density', unit: 'g/cm³' },
		{ value: 'meltingPoint', label: 'Melting Point', unit: '°C' },
	];

	const getTrendColor = (elementNum: number, trend: string): string => {
		const details = ELEMENT_DETAILS[elementNum];
		if (!details) return 'bg-muted';

		const getValue = (): number | null => {
			switch (trend) {
				case 'electronegativity':
					return details.electronegativity;
				case 'atomicRadius':
					return details.atomicRadius;
				case 'ionizationEnergy':
					return details.ionizationEnergy;
				case 'density':
					if (details.density === 'Unknown') return null;
					return Number.parseFloat(details.density);
				case 'meltingPoint':
					if (details.meltingPoint === 'Unknown' || details.meltingPoint === 'N/A') return null;
					return Number.parseFloat(details.meltingPoint.replace(/[^\d.-]/g, ''));
				default:
					return null;
			}
		};

		const value = getValue();
		if (value === null) return 'bg-muted';

		const ranges: Record<string, { min: number; max: number }> = {
			electronegativity: { min: 0.7, max: 4.0 },
			atomicRadius: { min: 30, max: 300 },
			ionizationEnergy: { min: 375, max: 2372 },
			density: { min: 0.09, max: 22.6 },
			meltingPoint: { min: -272, max: 3823 },
		};

		const range = ranges[trend];
		const normalized = (value - range.min) / (range.max - range.min);

		if (normalized < 0.2) return 'bg-blue-300';
		if (normalized < 0.4) return 'bg-blue-400';
		if (normalized < 0.6) return 'bg-yellow-400';
		if (normalized < 0.8) return 'bg-orange-500';
		return 'bg-red-500';
	};

	const filteredElements = useMemo(() => {
		return ELEMENTS.filter((el) => {
			const matchesSearch =
				searchQuery === '' ||
				el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				el.sym.toLowerCase().includes(searchQuery.toLowerCase()) ||
				el.num.toString().includes(searchQuery);
			const matchesGroup = selectedGroup === 'all' || el.group === selectedGroup;
			return matchesSearch && matchesGroup;
		});
	}, [searchQuery, selectedGroup]);

	const highlightedElements = useMemo(() => {
		if (searchQuery === '' && selectedGroup === 'all') return null;
		return new Set(filteredElements.map((el) => el.num));
	}, [filteredElements, searchQuery, selectedGroup]);

	useEffect(() => {
		const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
		checkDesktop();
		window.addEventListener('resize', checkDesktop);
		return () => window.removeEventListener('resize', checkDesktop);
	}, []);

	const handleCheckAnswer = () => {
		const details = selectedElement ? ELEMENT_DETAILS[selectedElement.num] : null;
		const practiceQuestions = details?.practiceQuestions || [
			{
				question: `What is the atomic number of ${selectedElement?.name}?`,
				options: [
					((selectedElement?.num || 1) - 1).toString(),
					(selectedElement?.num || 1).toString(),
					((selectedElement?.num || 1) + 1).toString(),
					((selectedElement?.num || 1) + 2).toString(),
				],
				answer: 1,
			},
		];
		if (selectedAnswer === practiceQuestions[0].answer) {
			setShowAnswer(true);
		}
	};

	const handleClose = () => {
		setSelectedElement(null);
		setSelectedAnswer(null);
		setShowAnswer(false);
	};

	const handleElementClick = (element: ElementType) => {
		setSelectedElement(element);
		setSelectedAnswer(null);
		setShowAnswer(false);
	};

	const startQuiz = () => {
		const questions = generateQuizQuestions(10);
		setQuizQuestions(questions);
		setCurrentQuestion(0);
		setQuizScore({ correct: 0, total: 0 });
		setQuizStarted(true);
		setShowExplanation(false);
	};

	const handleQuizAnswer = (answerIndex: number) => {
		setSelectedAnswer(answerIndex);
		setShowExplanation(true);
		if (answerIndex === quizQuestions[currentQuestion].correctAnswer) {
			setQuizScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
		}
		setQuizScore((prev) => ({ ...prev, total: prev.total + 1 }));
	};

	const nextQuestion = () => {
		if (currentQuestion < quizQuestions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
			setSelectedAnswer(null);
			setShowExplanation(false);
		} else {
			setQuizStarted(false);
		}
	};

	const DesktopSheet = (
		<Sheet open={!!selectedElement} onOpenChange={(open) => !open && handleClose()}>
			<SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
				{selectedElement && (
					<>
						<SheetHeader className="mb-6">
							<SheetTitle className="text-xl font-black tracking-tight">
								{selectedElement.name}
							</SheetTitle>
							<SheetDescription className="text-sm">
								{CATEGORY_LABELS[selectedElement.group] || selectedElement.category}
							</SheetDescription>
						</SheetHeader>
						<ElementDetailContent
							element={selectedElement}
							selectedAnswer={selectedAnswer}
							setSelectedAnswer={setSelectedAnswer}
							showAnswer={showAnswer}
							setShowAnswer={setShowAnswer}
							handleCheckAnswer={handleCheckAnswer}
						/>
					</>
				)}
			</SheetContent>
		</Sheet>
	);

	const MobileDrawer = (
		<Drawer open={!!selectedElement} onClose={handleClose}>
			<DrawerContent className="max-h-[85vh]">
				{selectedElement && (
					<>
						<DrawerHeader className="text-left">
							<DrawerTitle className="text-xl font-black tracking-tight">
								{selectedElement.name}
							</DrawerTitle>
							<DrawerDescription className="text-sm">
								{CATEGORY_LABELS[selectedElement.group] || selectedElement.category}
							</DrawerDescription>
						</DrawerHeader>
						<div className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-120px)]">
							<ElementDetailContent
								element={selectedElement}
								selectedAnswer={selectedAnswer}
								setSelectedAnswer={setSelectedAnswer}
								showAnswer={showAnswer}
								setShowAnswer={setShowAnswer}
								handleCheckAnswer={handleCheckAnswer}
							/>
						</div>
					</>
				)}
			</DrawerContent>
		</Drawer>
	);

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			{quizStarted ? (
				<header className="px-4 sm:px-6 pt-6 pb-3 shrink-0 max-w-2xl mx-auto w-full">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-xl font-black tracking-normal">Element Quiz</h1>
							<p className="text-sm text-muted-foreground">
								Question {currentQuestion + 1} of {quizQuestions.length}
							</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-right">
								<p className="text-xs text-muted-foreground">Score</p>
								<p className="text-lg font-black">
									{quizScore.correct}/{quizScore.total}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setQuizStarted(false)}
								className="rounded-full font-bold"
							>
								Exit
							</Button>
						</div>
					</div>
					<div className="w-full bg-muted rounded-full h-2 mb-2">
						<div
							className="bg-primary rounded-full h-2 transition-all"
							style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
						/>
					</div>
				</header>
			) : (
				<header className="px-4 sm:px-6 pt-6 pb-3 shrink-0 max-w-6xl mx-auto w-full space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<h1 className="text-xl font-black tracking-normal">Periodic Table</h1>
							<Button
								variant="outline"
								size="sm"
								onClick={startQuiz}
								className="rounded-full font-bold text-xs"
							>
								Take Quiz
							</Button>
							<Select
								value={trendsMode || 'none'}
								onValueChange={(val) => setTrendsMode(val === 'none' ? null : val)}
							>
								<SelectTrigger className="w-[140px] h-8 rounded-full text-xs font-bold">
									<SelectValue placeholder="Trends" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">View Mode</SelectItem>
									{trendOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								variant={compareMode ? 'default' : 'outline'}
								size="sm"
								onClick={() => {
									setCompareMode(!compareMode);
									if (compareMode) setCompareElements([]);
								}}
								className="rounded-full font-bold text-xs"
							>
								Compare{compareElements.length > 0 ? ` (${compareElements.length})` : ''}
							</Button>
						</div>
						<div className="text-xs font-medium text-muted-foreground hidden sm:block">
							{trendsMode
								? 'View periodic trends'
								: compareMode
									? 'Select 2 elements to compare'
									: 'Click any element to learn more'}
						</div>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
						<div className="relative flex-1">
							<HugeiconsIcon
								icon={SearchIcon}
								className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-2"
							/>

							<Input
								placeholder="Search by name, symbol, or number..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 pr-9 h-10 bg-background/80 backdrop-blur-sm placeholder:text-sm"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors z-2"
									aria-label="Clear search"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
									>
										<title>Clear search</title>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							)}
						</div>
						<Select value={selectedGroup} onValueChange={setSelectedGroup}>
							<SelectTrigger className="w-full sm:w-[180px] h-10 bg-background/80 backdrop-blur-sm">
								<SelectValue placeholder="Filter by group" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Groups</SelectItem>
								<SelectItem value="nonmetal">Nonmetals</SelectItem>
								<SelectItem value="noble">Noble Gases</SelectItem>
								<SelectItem value="alkali">Alkali Metals</SelectItem>
								<SelectItem value="alkaline">Alkaline Earth</SelectItem>
								<SelectItem value="metalloid">Metalloids</SelectItem>
								<SelectItem value="halogen">Halogens</SelectItem>
								<SelectItem value="transition">Transition Metals</SelectItem>
								<SelectItem value="metal">Post-Transition</SelectItem>
								<SelectItem value="lanthanide">Lanthanides</SelectItem>
								<SelectItem value="actinide">Actinides</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{[
							{ value: 'nonmetal', label: 'Nonmetals', color: 'bg-primary-violet' },
							{ value: 'noble', label: 'Noble Gases', color: 'bg-accent-blue' },
							{ value: 'alkali', label: 'Alkali', color: 'bg-primary-orange' },
							{ value: 'halogen', label: 'Halogens', color: 'bg-destructive' },
							{ value: 'transition', label: 'Transition', color: 'bg-blue-500' },
						].map((group) => (
							<button
								type="button"
								key={group.value}
								onClick={() =>
									setSelectedGroup(selectedGroup === group.value ? 'all' : group.value)
								}
								className={cn(
									'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border',
									selectedGroup === group.value
										? `${group.color}/30 border-current text-foreground ring-1 ring-current`
										: 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
								)}
							>
								{group.label}
							</button>
						))}
					</div>
					{(searchQuery !== '' || selectedGroup !== 'all') && (
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-xs text-muted-foreground">
								Showing {filteredElements.length} of {ELEMENTS.length} elements
							</span>
							<button
								type="button"
								onClick={() => {
									setSearchQuery('');
									setSelectedGroup('all');
								}}
								className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
							>
								Clear filters
							</button>
						</div>
					)}
				</header>
			)}

			{quizStarted ? (
				<ScrollArea className="flex-1">
					<main className="px-4 py-6 pb-32 max-w-2xl mx-auto w-full">
						<div className="space-y-6">
							<div className="p-6 bg-card rounded-2xl border shadow-sm">
								<h2 className="text-lg font-bold mb-4">
									{quizQuestions[currentQuestion].question}
								</h2>
								<RadioGroup
									value={selectedAnswer?.toString()}
									onValueChange={(val) => handleQuizAnswer(Number.parseInt(val, 10))}
									className="space-y-3"
								>
									{quizQuestions[currentQuestion].options.map((option, idx) => (
										<div
											key={idx}
											className={cn(
												'flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer',
												showExplanation
													? idx === quizQuestions[currentQuestion].correctAnswer
														? 'bg-success/20 border-success'
														: selectedAnswer === idx
															? 'bg-destructive/20 border-destructive'
															: 'border-border bg-muted/30'
													: selectedAnswer === idx
														? 'border-primary bg-primary/10'
														: 'border-border hover:border-primary/50'
											)}
										>
											<RadioGroupItem value={idx.toString()} id={`quiz-opt-${idx}`} />
											<Label
												htmlFor={`quiz-opt-${idx}`}
												className="flex-1 cursor-pointer font-medium"
											>
												{option}
											</Label>
										</div>
									))}
								</RadioGroup>
								{showExplanation && (
									<div
										className={cn(
											'mt-4 p-4 rounded-xl text-sm',
											selectedAnswer === quizQuestions[currentQuestion].correctAnswer
												? 'bg-success/20 text-success'
												: 'bg-destructive/20 text-destructive'
										)}
									>
										<p className="font-bold mb-1">
											{selectedAnswer === quizQuestions[currentQuestion].correctAnswer
												? 'Correct!'
												: 'Incorrect'}
										</p>
										<p>{quizQuestions[currentQuestion].explanation}</p>
									</div>
								)}
								{showExplanation && (
									<Button onClick={nextQuestion} className="w-full mt-4 rounded-full font-bold">
										{currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
									</Button>
								)}
							</div>
						</div>
					</main>
				</ScrollArea>
			) : (
				<ScrollArea className="flex-1">
					<main className="px-4 py-2 flex flex-col items-start pb-32 max-w-6xl mx-auto w-full gap-6">
						<div className="w-full max-w-5xl mx-auto">
							<div className="flex flex-wrap justify-center gap-1">
								{ELEMENTS.map((el, i) => (
									<m.button
										key={el.num}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{
											opacity: highlightedElements && !highlightedElements.has(el.num) ? 0.15 : 1,
											scale: 1,
										}}
										transition={{ delay: Math.min(i * 0.01, 1) }}
										whileHover={
											highlightedElements && !highlightedElements.has(el.num)
												? {}
												: { scale: 1.1, zIndex: 10 }
										}
										whileTap={
											highlightedElements && !highlightedElements.has(el.num) ? {} : { scale: 0.95 }
										}
										onClick={() => {
											if (highlightedElements && !highlightedElements.has(el.num)) return;
											if (compareMode) {
												handleCompareSelect(el);
											} else {
												handleElementClick(el);
											}
										}}
										className={cn(
											'w-16 h-20 sm:w-16 sm:h-20 rounded-sm border flex flex-col items-center justify-between py-2 transition-all shadow-sm bg-card cursor-pointer',
											trendsMode && getTrendColor(el.num, trendsMode),
											!trendsMode && el.num >= 57 && el.num <= 71 && 'row-start-1 row-end-1',
											!trendsMode && el.num >= 89 && el.num <= 103 && 'row-start-1 row-end-1',
											compareMode &&
												compareElements.find((e) => e.num === el.num) &&
												'ring-2 ring-primary border-primary',
											!compareMode && selectedElement?.num === el.num
												? 'ring-2 ring-primary border-primary shadow-primary/30 scale-110 z-10'
												: highlightedElements && !highlightedElements.has(el.num)
													? 'opacity-20'
													: !trendsMode && GROUP_COLORS[el.group]
										)}
									>
										<span className="text-[10px] sm:text-[10px] font-bold self-start ml-1 opacity-50">
											{el.num}
										</span>
										<span className="text-[13px] sm:text-sm font-black">{el.sym}</span>
										<span className="text-[7px] sm:text-[7px] font-bold uppercase tracking-wider truncate w-full text-center max-w-full px-0.5">
											{el.name.length > 6 ? `${el.name.slice(0, 5)}.` : el.name}
										</span>
									</m.button>
								))}
							</div>

							<div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 px-2">
								{trendsMode ? (
									<>
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 rounded-sm bg-blue-300" />
											<span className="text-[10px] font-bold">Low</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 rounded-sm bg-blue-400" />
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 rounded-sm bg-yellow-400" />
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 rounded-sm bg-orange-500" />
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 rounded-sm bg-red-500" />
											<span className="text-[10px] font-bold">High</span>
										</div>
									</>
								) : (
									Object.entries(GROUP_COLORS).map(([group, color]) => (
										<div key={group} className="flex items-center gap-2">
											<div className={cn('w-3 h-3 rounded-sm border', color.split(' ')[0])} />
											<span className="text-[10px] font-bold uppercase">
												{CATEGORY_LABELS[group] || group}
											</span>
										</div>
									))
								)}
							</div>
						</div>
						{compareMode && compareElements.length === 2 && (
							<div className="w-full max-w-4xl mx-auto mt-8">
								<h2 className="text-xl font-black mb-4 text-center">Element Comparison</h2>
								<div className="grid grid-cols-2 gap-4">
									{compareElements.map((el) => {
										const details = ELEMENT_DETAILS[el.num];
										return (
											<div key={el.num} className="p-4 bg-card rounded-xl border">
												<div className="flex items-center gap-3 mb-4">
													<div
														className={cn(
															'w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center',
															GROUP_COLORS[el.group]
														)}
													>
														<span className="text-xs font-bold opacity-60">{el.num}</span>
														<span className="text-2xl font-black">{el.sym}</span>
													</div>
													<div>
														<h3 className="font-black">{el.name}</h3>
														<p className="text-xs text-muted-foreground">{el.mass} u</p>
													</div>
												</div>
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">Category</span>
														<span className="font-bold">
															{CATEGORY_LABELS[el.group] || el.category}
														</span>
													</div>
													{details && (
														<>
															<div className="flex justify-between">
																<span className="text-muted-foreground">Electronegativity</span>
																<span className="font-bold">
																	{details.electronegativity ?? 'N/A'}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">Atomic Radius</span>
																<span className="font-bold">
																	{details.atomicRadius ? `${details.atomicRadius} pm` : 'N/A'}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">Ionization Energy</span>
																<span className="font-bold">
																	{details.ionizationEnergy
																		? `${details.ionizationEnergy} kJ/mol`
																		: 'N/A'}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">Density</span>
																<span className="font-bold">{details.density}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">Melting Point</span>
																<span className="font-bold">{details.meltingPoint}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-muted-foreground">Boiling Point</span>
																<span className="font-bold">{details.boilingPoint}</span>
															</div>
														</>
													)}
												</div>
											</div>
										);
									})}
								</div>
								<Button
									variant="outline"
									onClick={() => setCompareElements([])}
									className="w-full mt-4 rounded-full font-bold"
								>
									Clear Comparison
								</Button>
							</div>
						)}
					</main>
				</ScrollArea>
			)}

			{!quizStarted && <AnimatePresence>{isDesktop ? DesktopSheet : MobileDrawer}</AnimatePresence>}
		</div>
	);
}
