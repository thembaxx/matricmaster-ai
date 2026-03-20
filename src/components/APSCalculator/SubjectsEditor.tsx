import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubjectGradeRow } from './SubjectGradeRow';

interface SubjectGrade {
	subject: string;
	grade: string;
	points: number;
}

interface SubjectsEditorProps {
	subjects: SubjectGrade[];
	totalAPS: number;
	onNameChange: (index: number, subject: string) => void;
	onGradeChange: (index: number, grade: string) => void;
	onRemove: (index: number) => void;
	onAdd: () => void;
}

function getApsColor(aps: number) {
	if (aps >= 45) return 'text-green-500';
	if (aps >= 35) return 'text-blue-500';
	if (aps >= 25) return 'text-yellow-500';
	return 'text-red-500';
}

export function SubjectsEditor({
	subjects,
	totalAPS,
	onNameChange,
	onGradeChange,
	onRemove,
	onAdd,
}: SubjectsEditorProps) {
	return (
		<Card className="rounded-xl">
			<CardHeader>
				<CardTitle>Your Subjects & Grades</CardTitle>
				<CardDescription className="text-pretty">
					Select your 7 best subjects (including Life Orientation)
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{subjects.map((subj, index) => (
					<SubjectGradeRow
						key={`subject-${index}`}
						subject={subj.subject}
						grade={subj.grade}
						points={subj.points}
						index={index}
						allSubjects={subjects}
						onNameChange={onNameChange}
						onGradeChange={onGradeChange}
						onRemove={onRemove}
						canRemove={subjects.length > 3}
					/>
				))}

				{subjects.length < 7 && (
					<Button variant="outline" onClick={onAdd} className="w-full font-semibold text-[13px]">
						<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
						Add Subject
					</Button>
				)}

				<div className="pt-4 border-t">
					<div className="flex justify-between items-center">
						<span className="text-lg font-semibold">Total APS</span>
						<span className={`text-3xl font-bold font-mono ${getApsColor(totalAPS)}`}>
							{totalAPS}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
