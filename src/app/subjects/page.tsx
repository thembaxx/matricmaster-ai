'use client';

import { ArrowLeft01Icon, CheckmarkCircle02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	enrollInSubjectAction,
	getEnrolledSubjectsAction,
	getSubjectsAction,
} from '@/lib/db/actions';

export default function SubjectsPage() {
	const router = useRouter();
	const [allSubjects, setAllSubjects] = useState<any[]>([]);
	const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			setIsLoading(true);
			try {
				const [subs, enrolled] = await Promise.all([
					getSubjectsAction(),
					getEnrolledSubjectsAction(),
				]);
				setAllSubjects(subs);
				setEnrolledIds(enrolled.map((e: any) => e.id));
			} catch (error) {
				console.error('Failed to load subjects:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadData();
	}, []);

	const handleEnroll = async (subjectId: number) => {
		const result = await enrollInSubjectAction(subjectId);
		if (result.success) {
			setEnrolledIds((prev) => [...prev, subjectId]);
			toast.success('Enrolled successfully!');
		} else {
			toast.error('Failed to enroll');
		}
	};

	if (isLoading) {
		return <div className="p-12 text-center">Loading subjects...</div>;
	}

	return (
		<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
			<div className="flex items-center gap-4 mb-8">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<div>
					<h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
						Subject Marketplace
					</h1>
					<p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">
						Enroll in your 2026 Matric subjects
					</p>
				</div>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{allSubjects.map((subject) => {
					const isEnrolled = enrolledIds.includes(subject.id);
					return (
						<Card
							key={subject.id}
							className="shadow-tiimo border-border/50 overflow-hidden flex flex-col"
						>
							<CardHeader className="bg-muted/30">
								<CardTitle className="text-xl font-black uppercase tracking-tight">
									{subject.name}
								</CardTitle>
								<CardDescription className="text-xs font-bold uppercase tracking-wider">
									{subject.curriculumCode}
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6 flex-1 flex flex-col gap-6">
								<p className="text-sm text-muted-foreground line-clamp-3">{subject.description}</p>

								<div className="mt-auto">
									{isEnrolled ? (
										<Button
											variant="outline"
											className="w-full rounded-full gap-2 text-success border-success/30 bg-success/5"
											disabled
										>
											<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
											Enrolled
										</Button>
									) : (
										<Button
											onClick={() => handleEnroll(subject.id)}
											className="w-full rounded-full gap-2 shadow-xl shadow-primary/20"
										>
											<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
											Enroll Now
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
