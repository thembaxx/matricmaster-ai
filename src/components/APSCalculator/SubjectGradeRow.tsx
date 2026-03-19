import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { GRADES, SOUTH_AFRICAN_SUBJECTS } from './constants';

interface SubjectGradeRowProps {
	subject: string;
	grade: string;
	points: number;
	index: number;
	allSubjects: { subject: string; grade: string; points: number }[];
	onNameChange: (index: number, subject: string) => void;
	onGradeChange: (index: number, grade: string) => void;
	onRemove: (index: number) => void;
	canRemove: boolean;
}

function getGradeColor(grade: string) {
	if (!grade || grade === 'U') return '';
	const num = Number.parseInt(grade, 10);
	if (num >= 6) return 'text-green-500';
	if (num >= 4) return 'text-blue-500';
	if (num >= 3) return 'text-yellow-500';
	return 'text-red-500';
}

export function SubjectGradeRow({
	subject,
	grade,
	points,
	index,
	allSubjects,
	onNameChange,
	onGradeChange,
	onRemove,
	canRemove,
}: SubjectGradeRowProps) {
	return (
		<div className="flex gap-2 items-center">
			<Select
				onValueChange={(value) => onNameChange(index, value)}
				aria-label={`Select subject ${index + 1}`}
			>
				<SelectTrigger className="h-10">
					<SelectValue placeholder="Select subject" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{SOUTH_AFRICAN_SUBJECTS.map((s) => (
							<SelectItem
								key={s}
								value={s}
								disabled={allSubjects.some((sub, i) => i !== index && sub.subject === s)}
							>
								{s}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<Select
				onValueChange={(value) => onGradeChange(index, value)}
				aria-label={`Select grade ${index + 1}`}
			>
				<SelectTrigger
					className={`w-20 h-10 shrink-0 px-2 rounded-lg border bg-background text-sm font-medium text-center focus:ring-2 focus:ring-primary transition-colors ${getGradeColor(grade)}`}
					value={grade}
					aria-label={`Grade for ${subject}`}
				>
					<SelectValue placeholder="—" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{GRADES.map((g) => (
							<SelectItem
								key={`${g}-${index}`}
								id={`grade-${index}`}
								value={g}
								aria-label={`Grade for ${g}`}
							>
								{g}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<span
				className={`w-8 text-center text-xs text-muted-foreground font-mono font-semibold ${getGradeColor(grade)}`}
				role="status"
				aria-label={`${points} points`}
			>
				{points}
			</span>
			{canRemove && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onRemove(index)}
					aria-label={`Remove ${subject || 'subject'}`}
					className="text-muted-foreground hover:text-destructive"
				>
					<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
				</Button>
			)}
		</div>
	);
}
