import { Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { OptionFormData, QuestionFormData } from '@/hooks/useQuestionManager';

interface QuestionOptionsTabProps {
	editingQuestion: QuestionFormData;
	addOption: () => void;
	removeOption: (index: number) => void;
	updateOption: (index: number, field: keyof OptionFormData, value: string | boolean) => void;
}

export function QuestionOptionsTab({
	editingQuestion,
	addOption,
	removeOption,
	updateOption,
}: QuestionOptionsTabProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-4">
				<Label className="font-black text-xs  tracking-widest text-muted-foreground">
					Answer Possibilities
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addOption}
					className="rounded-xl h-10 px-4 font-black text-[10px]  tracking-widest border-2"
				>
					<HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" /> Add
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{editingQuestion.options.map((opt, idx) => (
					<div
						key={opt.optionLetter}
						className="p-6 rounded-3xl border-2 bg-muted/20 space-y-4 relative"
					>
						<div className="flex items-center justify-between">
							<Badge className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg bg-primary shadow-lg shadow-primary/20">
								{opt.optionLetter}
							</Badge>
							<div className="flex items-center gap-2">
								<Checkbox
									id={`correct-${idx}`}
									checked={opt.isCorrect}
									onCheckedChange={(v) => updateOption(idx, 'isCorrect', !!v)}
									className="h-6 w-6 rounded-lg border-2"
								/>
								<Label
									htmlFor={`correct-${idx}`}
									className="text-[10px] font-black  tracking-widest text-muted-foreground cursor-pointer"
								>
									Correct
								</Label>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-rose-500"
									onClick={() => removeOption(idx)}
									aria-label="Remove option"
								>
									<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<Textarea
							value={opt.optionText}
							onChange={(e) => updateOption(idx, 'optionText', e.target.value)}
							className="min-h-20 rounded-xl border-2 font-bold"
							placeholder="Answer text..."
						/>
						<Textarea
							value={opt.explanation}
							onChange={(e) => updateOption(idx, 'explanation', e.target.value)}
							className="min-h-15 rounded-xl border-2 text-xs font-bold bg-background"
							placeholder="Explanation..."
						/>
					</div>
				))}
			</div>
		</div>
	);
}
