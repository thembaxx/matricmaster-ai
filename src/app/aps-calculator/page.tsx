'use client';

import { CalculatorIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';
import { AboutAPS } from '@/components/APSCalculator/AboutAPS';
import { GRADE_POINTS, UNIVERSITY_REQUIREMENTS } from '@/components/APSCalculator/constants';
import { EligibleUniversities } from '@/components/APSCalculator/EligibleUniversities';
import { PathfinderDashboard } from '@/components/APSCalculator/PathfinderDashboard';
import { PathToUniversity } from '@/components/APSCalculator/PathToUniversity';
import { SubjectsEditor } from '@/components/APSCalculator/SubjectsEditor';

interface SubjectGrade {
	subject: string;
	grade: string;
	points: number;
}

interface UniversityRequirement {
	name: string;
	faculty: string;
	minAps: number;
	additionalRequirements?: string;
}

export default function APSCalculatorPage() {
	const [subjects, setSubjects] = useState<SubjectGrade[]>([
		{ subject: 'Mathematics', grade: '5', points: 5 },
		{ subject: 'Physical Sciences', grade: '5', points: 5 },
		{ subject: 'Life Sciences', grade: '4', points: 4 },
		{ subject: 'Geography', grade: '4', points: 4 },
		{ subject: 'English Home Language', grade: '5', points: 5 },
		{ subject: 'Life Orientation', grade: '6', points: 6 },
		{ subject: 'Accounting', grade: '4', points: 4 },
	]);
	const [selectedTarget, setSelectedTarget] = useState<UniversityRequirement | null>(null);

	const totalAPS = useMemo(() => {
		return subjects.reduce((sum, subj) => sum + subj.points, 0);
	}, [subjects]);

	const updateSubjectGrade = (index: number, grade: string) => {
		const newSubjects = [...subjects];
		newSubjects[index].points = GRADE_POINTS[grade] || 0;
		newSubjects[index].grade = grade;
		setSubjects(newSubjects);
	};

	const updateSubjectName = (index: number, subject: string) => {
		const newSubjects = [...subjects];
		newSubjects[index].subject = subject;
		setSubjects(newSubjects);
	};

	const addSubject = () => {
		if (subjects.length < 7) {
			setSubjects([...subjects, { subject: '', grade: '', points: 0 }]);
		}
	};

	const removeSubject = (index: number) => {
		if (subjects.length > 3) {
			const newSubjects = subjects.filter((_, i) => i !== index);
			setSubjects(newSubjects);
		}
	};

	const eligibleUniversities = useMemo(() => {
		return UNIVERSITY_REQUIREMENTS.filter((uni) => totalAPS >= uni.minAps).sort(
			(a, b) => a.minAps - b.minAps
		);
	}, [totalAPS]);

	const closestUniversities = useMemo(() => {
		return UNIVERSITY_REQUIREMENTS.filter((uni) => totalAPS < uni.minAps)
			.sort((a, b) => a.minAps - b.minAps)
			.slice(0, 3);
	}, [totalAPS]);

	const getGoalPath = (target: UniversityRequirement) => {
		const apsNeeded = target.minAps - totalAPS;
		if (apsNeeded <= 0) return null;

		const currentGrades = subjects.filter((s) =>
			['Mathematics', 'Physical Sciences'].includes(s.subject)
		);

		const improvements: string[] = [];
		if (currentGrades.some((g) => g.points < 7)) {
			improvements.push('Improve Mathematics or Physical Sciences by 1 grade');
		}
		if (currentGrades.some((g) => g.points < 6)) {
			improvements.push('Get at least a 5 (C) in your best subjects');
		}

		return {
			apsNeeded,
			improvements,
			path: `Earn ${apsNeeded} more APS points to reach ${target.minAps}`,
		};
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="sm:max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
						<HugeiconsIcon icon={CalculatorIcon} className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold mb-2">University APS Calculator</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						Calculate your Admission Point Score (APS) and see which universities you qualify for
					</p>
				</div>

				<div className="mb-12">
					<PathfinderDashboard
						subjects={subjects}
						totalAPS={totalAPS}
						targetUniversity={selectedTarget || undefined}
					/>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<SubjectsEditor
						subjects={subjects}
						totalAPS={totalAPS}
						onNameChange={updateSubjectName}
						onGradeChange={updateSubjectGrade}
						onRemove={removeSubject}
						onAdd={addSubject}
					/>

					<EligibleUniversities
						eligibleUniversities={eligibleUniversities}
						totalAPS={totalAPS}
						onSelect={setSelectedTarget}
					/>

					<PathToUniversity
						closestUniversities={closestUniversities}
						totalAPS={totalAPS}
						getGoalPath={getGoalPath}
					/>
				</div>

				<AboutAPS />
			</div>
		</div>
	);
}
