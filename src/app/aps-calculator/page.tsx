'use client';

import { CalculatorIcon, Cancel01Icon, HelpCircleIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const SOUTH_AFRICAN_SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'History',
	'English Home Language',
	'English First Additional Language',
	'Afrikaans Home Language',
	'Afrikaans First Additional Language',
	'Accounting',
	'Business Studies',
	'Economics',
	'Information Technology',
	'Computer Applications Technology',
	'Mathematics Literacy',
	'Life Orientation',
	'Art',
	'Music',
	'Drama',
	'Design',
];

const GRADE_POINTS: Record<string, number> = {
	'7': 7,
	'6': 6,
	'5': 5,
	'4': 4,
	'3': 3,
	'2': 2,
	'1': 1,
	U: 0,
};

const GRADES = ['7', '6', '5', '4', '3', '2', '1', 'U'];

const UNIVERSITY_REQUIREMENTS: UniversityRequirement[] = [
	{
		name: 'University of Cape Town',
		faculty: 'Engineering',
		minAps: 42,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of Cape Town',
		faculty: 'Health Sciences',
		minAps: 45,
		additionalRequirements: 'Mathematics + Physical Sciences (6+)',
	},
	{ name: 'University of Cape Town', faculty: 'Commerce', minAps: 38 },
	{
		name: 'University of the Witwatersrand',
		faculty: 'Engineering',
		minAps: 42,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of the Witwatersrand',
		faculty: 'Health Sciences',
		minAps: 44,
		additionalRequirements: 'Mathematics + Physical Sciences (6+)',
	},
	{
		name: 'University of Pretoria',
		faculty: 'Engineering',
		minAps: 40,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'Stellenbosch University',
		faculty: 'Engineering',
		minAps: 38,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'Stellenbosch University',
		faculty: 'Medicine',
		minAps: 42,
		additionalRequirements: 'Mathematics + Physical Sciences (6+)',
	},
	{ name: 'University of Johannesburg', faculty: 'Engineering', minAps: 26 },
	{ name: 'University of Johannesburg', faculty: 'Health Sciences', minAps: 30 },
	{ name: 'University of KwaZulu-Natal', faculty: 'Engineering', minAps: 30 },
	{ name: 'University of the Free State', faculty: 'Health Sciences', minAps: 32 },
	{ name: 'University of the Western Cape', faculty: 'Dentistry', minAps: 35 },
];

export default function APSCalculatorPage() {
	const [subjects, setSubjects] = useState<SubjectGrade[]>([
		{ subject: 'Mathematics', grade: '', points: 0 },
		{ subject: 'English Home Language', grade: '', points: 0 },
		{ subject: 'Life Orientation', grade: '', points: 0 },
	]);

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

	const getApsColor = (aps: number) => {
		if (aps >= 45) return 'text-green-500';
		if (aps >= 35) return 'text-blue-500';
		if (aps >= 25) return 'text-yellow-500';
		return 'text-red-500';
	};

	const getGradeColor = (grade: string) => {
		if (!grade || grade === 'U') return '';
		const num = Number.parseInt(grade, 10);
		if (num >= 6) return 'text-green-500';
		if (num >= 4) return 'text-blue-500';
		if (num >= 3) return 'text-yellow-500';
		return 'text-red-500';
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

				<div className="grid md:grid-cols-2 gap-6">
					<Card className='rounded-xl'>
						<CardHeader>
							<CardTitle>Your Subjects & Grades</CardTitle>
							<CardDescription className='text-pretty'>
								Select your 7 best subjects (including Life Orientation)
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{subjects.map((subj, index) => (
								<div key={index} className="flex gap-2 items-center">
									<Select onValueChange={(value) => updateSubjectName(index, value)} aria-label={`Select subject ${index + 1}`}>
										<SelectTrigger className='h-10'>
											<SelectValue placeholder="Select subject" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{SOUTH_AFRICAN_SUBJECTS.map((s) => (
													<SelectItem
														key={s}
														value={s}
														disabled={subjects.some((sub, i) => i !== index && sub.subject === s)}
													>
														{s}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<Select onValueChange={(value) => updateSubjectGrade(index, value)} aria-label={`Select grade ${index + 1}`}>
										<SelectTrigger className={`w-20 h-10 shrink-0 px-2 rounded-lg border bg-background text-sm font-medium text-center focus:ring-2 focus:ring-primary transition-colors ${getGradeColor(subj.grade)}`}
											value={subj.grade}
											aria-label={`Grade for ${subj.subject}`}>
											<SelectValue placeholder="—" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{GRADES.map((g) => (
													<SelectItem
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
										className={`w-8 text-center text-xs text-muted-foreground font-mono font-semibold ${getGradeColor(subj.grade)}`}
										role="status"
										aria-label={`${subj.points} points`}
									>
										{subj.points}
									</span>
									{subjects.length > 3 && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => removeSubject(index)}
											aria-label={`Remove ${subj.subject || 'subject'}`}
											className="text-muted-foreground hover:text-destructive"
										>
											<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
										</Button>
									)}
								</div>
							))}

							{subjects.length < 7 && (
								<Button variant="outline" onClick={addSubject} className="w-full font-semibold text-[13px]">
									<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
									Add Subject
								</Button>
							)}

							<div className="pt-4 border-t">
								<div className="flex justify-between items-center">
									<span className="text-lg font-semibold">Total APS</span>
									<span className={`text-3xl font-bold font-mono ${getApsColor(totalAPS)}`}>{totalAPS}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='rounded-xl'>
						<CardHeader>
							<CardTitle>Eligible Universities</CardTitle>
							<CardDescription>Based on your APS score of {totalAPS}</CardDescription>
						</CardHeader>
						<CardContent>
							{eligibleUniversities.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>Your APS is too low for the listed universities.</p>
									<p className="text-sm mt-2 text-pretty">Most universities require at least 25-30 APS</p>
								</div>
							) : (
								<div className="space-y-3">
									{eligibleUniversities.map((uni, idx) => (
										<div
											key={`${uni.name}-${uni.faculty}-${idx}`}
											className="p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
										>
											<div className="flex items-start justify-between">
												<div>
													<h4 className="font-semibold text-sm">{uni.name}</h4>
													<p className="text-sm text-muted-foreground">{uni.faculty}</p>
												</div>
												<Badge variant="outline" className="shrink-0">
													APS: {uni.minAps}
												</Badge>
											</div>
											{uni.additionalRequirements && (
												<p className="text-xs text-muted-foreground mt-1">
													{uni.additionalRequirements}
												</p>
											)}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<Card className="mt-6 rounded-xl">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={HelpCircleIcon} className="w-5 h-5" />
							About APS
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground space-y-2">
						<p className='text-pretty'>
							<strong>APS (Admission Point Score)</strong> is used by South African universities to
							determine your eligibility for degree programmes.
						</p>
						<p className='text-pretty leading-5'>
							Each subject grade is converted to points: A (7), B (6), C (5), D (4), E (3), F (2), G
							(1), U (0). Your total APS is the sum of your best 7 subjects, including Life
							Orientation.
						</p>
						<p className="text-xs text-pretty">
							<em>
								Note: Requirements may change annually. Always verify with the university's official
								admissions office.
							</em>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
