'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CATEGORY_LABELS, type ElementType, GROUP_COLORS } from '@/constants/periodic-table';
import { ELEMENT_DETAILS } from '@/content/element-details';
import { cn } from '@/lib/utils';

interface ElementDetailProps {
	element: ElementType;
	selectedAnswer: number | null;
	setSelectedAnswer: (val: number | null) => void;
	showAnswer: boolean;
	handleCheckAnswer: () => void;
}

export function ElementDetailContent({
	element,
	selectedAnswer,
	setSelectedAnswer,
	showAnswer,
	handleCheckAnswer,
}: ElementDetailProps) {
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
					<span className="text-[8px] font-bold  tracking-wider">{element.name}</span>
				</div>
				<div className="flex-1 space-y-3">
					<div>
						<h2 className="text-2xl sm:text-3xl font-black tracking-tight">{element.name}</h2>
						<p className="text-sm font-medium text-muted-foreground  tracking-wider">
							{CATEGORY_LABELS[element.group] || element.category}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="bg-muted/50 rounded-lg p-3">
							<p className="text-muted-foreground text-xs">Atomic Mass</p>
							<p className="font-bold">{element.mass} u</p>
						</div>
						{details?.electronegativity && (
							<div className="bg-muted/50 rounded-lg p-3">
								<p className="text-muted-foreground text-xs">Electronegativity</p>
								<p className="font-bold">{details.electronegativity}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{details && (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{details.atomicRadius && (
						<div className="bg-muted/30 rounded-lg p-3 text-center">
							<p className="text-muted-foreground text-xs">Atomic Radius</p>
							<p className="font-bold">{details.atomicRadius} pm</p>
						</div>
					)}
					{details.ionizationEnergy && (
						<div className="bg-muted/30 rounded-lg p-3 text-center">
							<p className="text-muted-foreground text-xs">Ionization Energy</p>
							<p className="font-bold text-sm">{details.ionizationEnergy} kJ/mol</p>
						</div>
					)}
					{details.density !== 'Unknown' && (
						<div className="bg-muted/30 rounded-lg p-3 text-center">
							<p className="text-muted-foreground text-xs">Density</p>
							<p className="font-bold">{details.density} g/cm³</p>
						</div>
					)}
					{details.meltingPoint !== 'Unknown' && (
						<div className="bg-muted/30 rounded-lg p-3 text-center">
							<p className="text-muted-foreground text-xs">Melting Point</p>
							<p className="font-bold">{details.meltingPoint}</p>
						</div>
					)}
					{details.boilingPoint !== 'Unknown' && (
						<div className="bg-muted/30 rounded-lg p-3 text-center">
							<p className="text-muted-foreground text-xs">Boiling Point</p>
							<p className="font-bold">{details.boilingPoint}</p>
						</div>
					)}
				</div>
			)}

			<div className="border-t pt-6">
				<h3 className="font-bold mb-4">Practice Question</h3>
				<p className="text-sm mb-4">{currentQuestion.question}</p>
				<RadioGroup
					value={selectedAnswer?.toString()}
					onValueChange={(val) => setSelectedAnswer(Number.parseInt(val, 10))}
					className="space-y-2"
				>
					{currentQuestion.options.map((option, idx) => (
						<div
							key={`option-${option}`}
							className={cn(
								'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
								showAnswer
									? idx === currentQuestion.answer
										? 'bg-success/20 border-success'
										: selectedAnswer === idx
											? 'bg-destructive/20 border-destructive'
											: 'border-border bg-muted/30'
									: selectedAnswer === idx
										? 'border-primary bg-primary/10'
										: 'border-border hover:border-primary/50'
							)}
						>
							<RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
							<Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-sm">
								{option}
							</Label>
						</div>
					))}
				</RadioGroup>
				{!showAnswer && (
					<Button onClick={handleCheckAnswer} className="w-full mt-4 rounded-full font-bold">
						Check Answer
					</Button>
				)}
				{showAnswer && (
					<div
						className={cn(
							'mt-4 p-4 rounded-xl text-sm',
							selectedAnswer === currentQuestion.answer
								? 'bg-success/20 text-success'
								: 'bg-destructive/20 text-destructive'
						)}
					>
						<p className="font-bold mb-1">
							{selectedAnswer === currentQuestion.answer ? 'Correct!' : 'Incorrect'}
						</p>
						<p>
							{element.name} has atomic number {element.num}.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
