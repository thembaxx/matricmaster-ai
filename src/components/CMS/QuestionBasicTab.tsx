import { Cancel01Icon, ImageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { Subject } from '@/lib/db/schema';
import type { QuestionFormData } from './QuestionManager';

interface QuestionBasicTabProps {
	editingQuestion: QuestionFormData;
	setEditingQuestion: (q: QuestionFormData) => void;
	subjects: Subject[];
	fileInputId: string;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleRemoveImage: () => void;
	triggerFileInput: () => void;
}

export function QuestionBasicTab({
	editingQuestion,
	setEditingQuestion,
	subjects,
	fileInputId,
	fileInputRef,
	handleImageSelect,
	handleRemoveImage,
	triggerFileInput,
}: QuestionBasicTabProps) {
	return (
		<div className="space-y-8">
			<div className="space-y-3">
				<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
					Illustration
				</Label>
				{editingQuestion.imageUrl ? (
					<div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-border shadow-xl group">
						<Image
							src={editingQuestion.imageUrl}
							alt="Question"
							width={800}
							height={400}
							className="w-full h-full object-contain bg-muted"
							unoptimized
						/>
						<div className="absolute top-4 right-4 flex gap-2">
							<Button
								type="button"
								variant="destructive"
								size="icon"
								className="rounded-xl h-10 w-10"
								onClick={handleRemoveImage}
								aria-label="Remove image"
							>
								<HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
							</Button>
						</div>
					</div>
				) : (
					<div className="relative">
						<input
							type="file"
							id={fileInputId}
							ref={fileInputRef}
							onChange={handleImageSelect}
							accept="image/*"
							className="hidden"
						/>
						<label
							htmlFor={fileInputId}
							onClick={triggerFileInput}
							className="w-full h-48 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
						>
							<div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
								<HugeiconsIcon icon={ImageIcon} className="h-8 w-8 text-muted-foreground" />
							</div>
							<span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
								Upload Image (Max 4MB)
							</span>
						</label>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-8">
				<div className="space-y-3">
					<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
						Subject
					</Label>
					<Select
						value={editingQuestion.subjectId.toString()}
						onValueChange={(v) =>
							setEditingQuestion({
								...editingQuestion,
								subjectId: Number.parseInt(v, 10),
							})
						}
					>
						<SelectTrigger className="h-14 rounded-2xl border-2">
							<SelectValue placeholder="Select" />
						</SelectTrigger>
						<SelectContent className="rounded-2xl">
							{subjects.map((s) => (
								<SelectItem key={s.id} value={s.id.toString()}>
									{s.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-3">
					<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
						Grade
					</Label>
					<Select
						value={editingQuestion.gradeLevel.toString()}
						onValueChange={(v) =>
							setEditingQuestion({
								...editingQuestion,
								gradeLevel: Number.parseInt(v, 10),
							})
						}
					>
						<SelectTrigger className="h-14 rounded-2xl border-2">
							<SelectValue placeholder="Select" />
						</SelectTrigger>
						<SelectContent className="rounded-2xl">
							<SelectItem value="10">Grade 10</SelectItem>
							<SelectItem value="11">Grade 11</SelectItem>
							<SelectItem value="12">Grade 12</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-8">
				<div className="space-y-3">
					<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
						Topic
					</Label>
					<Input
						value={editingQuestion.topic}
						onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
						className="h-14 rounded-2xl border-2 font-bold"
					/>
				</div>
				<div className="space-y-3">
					<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
						Difficulty
					</Label>
					<Select
						value={editingQuestion.difficulty}
						onValueChange={(v) =>
							setEditingQuestion({
								...editingQuestion,
								difficulty: v as typeof editingQuestion.difficulty,
							})
						}
					>
						<SelectTrigger className="h-14 rounded-2xl border-2">
							<SelectValue placeholder="Select" />
						</SelectTrigger>
						<SelectContent className="rounded-2xl">
							<SelectItem value="easy">Easy</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="hard">Hard</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
