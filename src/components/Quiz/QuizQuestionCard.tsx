'use client';

import { memo, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type QuizOption = {
	id: string;
	text: string;
};

type QuizQuestionCardProps = {
	options: QuizOption[];
	selectedAnswer: string | null;
	correctAnswer?: string;
	showResult: boolean;
	colors: {
		bg: string;
		text: string;
		border: string;
		bgSoft: string;
		borderSoft: string;
	};
	onSelect: (id: string) => void;
};

export const QuizQuestionCard = memo(function QuizQuestionCard({
	options,
	selectedAnswer,
	correctAnswer,
	showResult,
	colors,
	onSelect,
}: QuizQuestionCardProps) {
	return (
		<Card className="p-4 bg-card border-none rounded-[2.5rem] shadow-sm relative overflow-hidden">
			<RadioGroup
				value={selectedAnswer || ''}
				onValueChange={onSelect}
				disabled={showResult}
				className="space-y-4 relative z-10"
			>
				{options.map((option) => (
					<div key={option.id} className="flex items-center">
						<RadioGroupItem value={option.id} id={option.id} className="sr-only" />
						<Label
							htmlFor={option.id}
							className={`flex-1 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
								selectedAnswer === option.id
									? `${colors.border} ${colors.bgSoft} shadow-md scale-[1.02]`
									: `border-border hover:border-primary/50 hover:bg-accent/30 ${colors.borderSoft}`
							} ${
								showResult && option.id === correctAnswer
									? 'border-tiimo-green bg-tiimo-green/10'
									: showResult && selectedAnswer === option.id && option.id !== correctAnswer
										? 'border-destructive bg-destructive/10'
										: ''
							}`}
						>
							<span
								className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
									selectedAnswer === option.id
										? showResult
											? option.id === correctAnswer
												? 'bg-tiimo-green text-white'
												: 'bg-destructive text-white'
											: `${colors.bg} text-white`
										: 'bg-muted text-muted-foreground'
								}`}
							>
								{option.id}
							</span>
							<span className="font-bold text-foreground">{option.text}</span>
						</Label>
					</div>
				))}
			</RadioGroup>
		</Card>
	);
});

type QuestionMetaProps = {
	icon: ReactNode;
	label: string;
};

export const QuestionMeta = memo(function QuestionMeta({ icon, label }: QuestionMetaProps) {
	return (
		<div className="flex items-center gap-3">
			{icon}
			<h3 className="text-[10px] font-black  text-muted-foreground tracking-[0.2em]">{label}</h3>
		</div>
	);
});
