'use client';

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

export function QuizQuestionCard({
	options,
	selectedAnswer,
	correctAnswer,
	showResult,
	colors,
	onSelect,
}: QuizQuestionCardProps) {
	return (
		<Card className="p-6 sm:p-8 bg-card border-none rounded-[2.5rem] shadow-sm relative overflow-hidden group">
			<div
				className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${colors.bgSoft}`}
			/>

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
							className={`flex-1 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedAnswer === option.id
									? `${colors.border} ${colors.bgSoft} shadow-md scale-[1.02]`
									: `border-border ${colors.borderSoft}`
								} ${showResult && option.id === correctAnswer
									? 'border-green-500 bg-green-500/10'
									: showResult && selectedAnswer === option.id && option.id !== correctAnswer
										? 'border-red-500 bg-red-500/10'
										: ''
								}`}
						>
							<span
								className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${selectedAnswer === option.id
										? `${colors.bg} text-white`
										: 'bg-muted text-zinc-500'
									}`}
							>
								{option.id}
							</span>
							<span className="font-bold text-zinc-700 dark:text-zinc-300">{option.text}</span>
						</Label>
					</div>
				))}
			</RadioGroup>
		</Card>
	);
}

type QuestionMetaProps = {
	icon: React.ReactNode;
	label: string;
};

export function QuestionMeta({ icon, label }: QuestionMetaProps) {
	return (
		<div className="flex items-center gap-3">
			{icon}
			<h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">{label}</h3>
		</div>
	);
}
