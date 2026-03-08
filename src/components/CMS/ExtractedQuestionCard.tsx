'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ExtractedOption, ExtractedQuestion } from '@/services/pdfExtractor';

interface ExtractedQuestionCardProps {
	question: ExtractedQuestion;
	index: number;
	onUpdateQuestion: (idx: number, field: keyof ExtractedQuestion, value: any) => void;
	onUpdateOption: (
		qIdx: number,
		optIdx: number,
		field: keyof ExtractedOption,
		value: string | boolean,
		sqIdx?: number
	) => void;
	onUpdateSubQuestion: (qIdx: number, sqIdx: number, field: string, value: any) => void;
}

export function ExtractedQuestionCard({
	question,
	index,
	onUpdateQuestion,
	onUpdateOption,
	onUpdateSubQuestion,
}: ExtractedQuestionCardProps) {
	return (
		<div className="p-8 rounded-[2rem] border-2 bg-background hover:border-brand-blue/30 transition-all space-y-6 shadow-sm">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-4">
					<Badge className="h-10 px-4 rounded-xl font-black text-sm bg-brand-blue shadow-lg shadow-brand-blue/20">
						Q{question.questionNumber}
					</Badge>
					<div className="flex items-center gap-2">
						<Input
							type="number"
							value={question.marks}
							onChange={(e) =>
								onUpdateQuestion(index, 'marks', Number.parseInt(e.target.value, 10))
							}
							className="w-16 h-10 rounded-xl border-2 text-center font-black"
						/>
						<span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
							Marks
						</span>
					</div>
				</div>
				<Select
					value={question.difficulty}
					onValueChange={(v) => onUpdateQuestion(index, 'difficulty', v)}
				>
					<SelectTrigger className="w-32 h-10 rounded-xl font-bold border-2">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="easy">Easy</SelectItem>
						<SelectItem value="medium">Medium</SelectItem>
						<SelectItem value="hard">Hard</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-3">
				<Label className="text-[10px] font-black uppercase text-muted-foreground">
					Question Stem
				</Label>
				<Textarea
					value={question.questionText}
					onChange={(e) => onUpdateQuestion(index, 'questionText', e.target.value)}
					className="min-h-24 rounded-2xl border-2 font-bold text-sm bg-muted/20"
				/>
			</div>

			{question.options && question.options.length > 0 && (
				<div className="space-y-3">
					<Label className="text-[10px] font-black uppercase text-muted-foreground">
						Multiple Choice Options
					</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{question.options.map((opt, oIdx) => (
							<div
								key={`${question.id}-opt-${opt.letter}-${oIdx}`}
								className={`flex gap-3 items-center p-3 rounded-2xl border-2 transition-all ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'bg-muted/10'}`}
							>
								<Badge
									variant={opt.isCorrect ? 'default' : 'outline'}
									className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${opt.isCorrect ? 'bg-emerald-500 hover:bg-emerald-500' : ''}`}
								>
									{opt.letter}
								</Badge>
								<Input
									value={opt.text}
									onChange={(e) => onUpdateOption(index, oIdx, 'text', e.target.value)}
									className="h-10 text-xs font-bold rounded-xl border-none shadow-none bg-transparent"
								/>
								<Checkbox
									checked={opt.isCorrect}
									onCheckedChange={(v) => onUpdateOption(index, oIdx, 'isCorrect', !!v)}
									className="h-5 w-5 rounded-md border-2 border-emerald-500 data-[state=checked]:bg-emerald-500"
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{question.subQuestions && question.subQuestions.length > 0 && (
				<div className="pt-6 border-t space-y-4">
					<Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
						Sub-Questions ({question.subQuestions.length})
					</Label>
					<div className="space-y-6">
						{question.subQuestions.map((sq, sIdx) => (
							<div
								key={`${question.id}-sq-${sq.id || sIdx}`}
								className="pl-6 border-l-4 border-brand-blue/20 space-y-4 py-2"
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-black text-brand-blue uppercase">
										Sub-Item {sq.id}
									</span>
									<div className="flex items-center gap-2">
										<Input
											type="number"
											value={sq.marks}
											onChange={(e) =>
												onUpdateSubQuestion(
													index,
													sIdx,
													'marks',
													Number.parseInt(e.target.value, 10)
												)
											}
											className="w-14 h-8 rounded-lg border-2 text-center font-black p-0 text-xs"
										/>
										<span className="text-[10px] font-black uppercase text-muted-foreground">
											Marks
										</span>
									</div>
								</div>
								<Textarea
									value={sq.text}
									onChange={(e) => onUpdateSubQuestion(index, sIdx, 'text', e.target.value)}
									className="min-h-20 rounded-xl border-2 font-bold text-xs bg-muted/10"
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
