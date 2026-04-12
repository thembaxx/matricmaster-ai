'use client';

import { ArrowLeft01Icon, CheckmarkCircle02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ViewTransition } from 'react';
import { toast } from 'sonner';
import { SubjectsSkeleton } from '@/components/SubjectsSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { EnrolledSubjectType } from '@/lib/db/actions';
import {
	enrollInSubjectAction,
	getEnrolledSubjectsAction,
	getSubjectsAction,
} from '@/lib/db/actions';
import type { Subject } from '@/lib/db/schema';

interface SubjectsData {
	subjects: Subject[];
	enrolledIds: number[];
}

export default function SubjectsPage() {
	const router = useRouter();
	const { data: enrolledData, isLoading } = useQuery<SubjectsData>({
		queryKey: ['subjects-and-enrollments'],
		queryFn: async () => {
			const [subs, enrolled] = await Promise.all([
				getSubjectsAction(),
				getEnrolledSubjectsAction(),
			]);
			return {
				subjects: subs,
				enrolledIds: enrolled.subjects.map((e: EnrolledSubjectType) => e.id),
			};
		},
	});

	const allSubjects = enrolledData?.subjects ?? [];
	const enrolledIds = enrolledData?.enrolledIds ?? [];

	const handleEnroll = async (subjectId: number) => {
		const result = await enrollInSubjectAction(subjectId);
		if (result.success) {
			toast.success('enrolled successfully!');
		} else {
			toast.error('failed to enroll');
		}
	};

	if (isLoading) {
		return <SubjectsSkeleton />;
	}

	return (
		<ViewTransition default="none" enter="vt-slide-up-fade" exit="vt-slide-down-fade">
			<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
				<div className="flex items-center gap-4 mb-8">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Go back"
						onClick={() => router.back()}
						className="rounded-full"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} aria-hidden="true" className="w-6 h-6" />
					</Button>
					<div>
						<h1 className="text-4xl font-black tracking-tight text-foreground">
							subject marketplace
						</h1>
						<p className="text-muted-foreground font-bold text-xs tracking-widest mt-1">
							enroll in your 2026 matric subjects
						</p>
					</div>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{allSubjects.map((subject) => {
						const isEnrolled = enrolledIds.includes(subject.id);
						return (
							<ViewTransition key={subject.id} default="none" enter="vt-pop-in" exit="vt-pop-out">
								<Link href={`/subjects/${subject.id}`}>
									<Card className="shadow-tiimo border-border/50 overflow-hidden flex flex-col transition-transform hover:scale-[1.02] active:scale-[0.98]">
										<ViewTransition
											name={`subject-icon-${subject.id}`}
											default="none"
											share="vt-expand"
										>
											<CardHeader className="bg-muted/30">
												<CardTitle className="text-xl font-black tracking-tight">
													{subject.name.toLowerCase()}
												</CardTitle>
												<CardDescription className="text-xs font-bold tracking-wider">
													{subject.curriculumCode.toLowerCase()}
												</CardDescription>
											</CardHeader>
										</ViewTransition>
										<CardContent className="p-6 flex-1 flex flex-col gap-6">
											<p className="text-sm text-muted-foreground line-clamp-3">
												{subject.description}
											</p>

											<div className="mt-auto">
												{isEnrolled ? (
													<Button
														variant="outline"
														className="w-full rounded-full gap-2 text-success border-success/30 bg-success/5"
														disabled
													>
														<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
														enrolled
													</Button>
												) : (
													<Button
														onClick={(e) => {
															e.preventDefault();
															handleEnroll(subject.id);
														}}
														className="w-full rounded-full gap-2 shadow-xl shadow-primary/20"
													>
														<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
														enroll now
													</Button>
												)}
											</div>
										</CardContent>
									</Card>
								</Link>
							</ViewTransition>
						);
					})}
				</div>
			</div>
		</ViewTransition>
	);
}
