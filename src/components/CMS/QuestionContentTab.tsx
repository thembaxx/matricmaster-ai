import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QuestionFormData } from './QuestionManager';

interface QuestionContentTabProps {
	editingQuestion: QuestionFormData;
	setEditingQuestion: (q: QuestionFormData) => void;
}

export function QuestionContentTab({
	editingQuestion,
	setEditingQuestion,
}: QuestionContentTabProps) {
	return (
		<div className="space-y-8">
			<div className="space-y-3">
				<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
					Question Content
				</Label>
				<Textarea
					value={editingQuestion.questionText}
					onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
					className="min-h-50 rounded-3xl border-2 p-6 font-bold text-lg leading-relaxed"
					placeholder="Type the question..."
				/>
			</div>
			<div className="space-y-3 max-w-50">
				<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
					Points
				</Label>
				<Input
					type="number"
					value={editingQuestion.marks}
					onChange={(e) =>
						setEditingQuestion({
							...editingQuestion,
							marks: Number.parseInt(e.target.value, 10),
						})
					}
					className="h-14 rounded-2xl border-2 font-black text-xl text-center"
				/>
			</div>
		</div>
	);
}
