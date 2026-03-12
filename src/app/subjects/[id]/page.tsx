'use client';

import {
	ArrowLeft01Icon,
	BookOpen01Icon,
	ChampionIcon,
	Clock01Icon,
	PlayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { getLessonsBySubject } from '@/lib/lessons';

export default function SubjectDetailsPage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const subjectId = params.id;
	const lessons = getLessonsBySubject(subjectId);

	return (
		<div className="container mx-auto max-w-4xl px-4 pt-8 pb-32">
			<header className="flex items-center gap-4 mb-8">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<div>
					<h1 className="text-3xl font-black uppercase tracking-tight capitalize">{subjectId.replace(/-/g, ' ')}</h1>
					<p className="text-xs font-black text-muted-foreground uppercase tracking-widest">South African NSC Curriculum</p>
				</div>
			</header>

			<div className="grid gap-6 md:grid-cols-3 mb-12">
				<Card className="shadow-tiimo border-border/50">
					<CardContent className="p-6 text-center">
						<p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Completion</p>
						<span className="text-3xl font-black">
							{lessons.length > 0 ? '12%' : '0%'}
						</span>
						<Progress value={lessons.length > 0 ? 12 : 0} className="h-1.5 mt-4" />
					</CardContent>
				</Card>
				<Card className="shadow-tiimo border-border/50">
					<CardContent className="p-6 text-center">
						<p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Total Modules</p>
						<span className="text-3xl font-black text-primary">{lessons.length}</span>
						<div className="flex items-center justify-center gap-1 mt-4 text-xs font-bold text-success uppercase tracking-widest">
							Ready to study
						</div>
					</CardContent>
				</Card>
				<Card className="shadow-tiimo border-border/50">
					<CardContent className="p-6 text-center">
						<p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Mastery</p>
						<span className="text-3xl font-black text-warning">Gold</span>
						<div className="flex items-center justify-center gap-1 mt-4 text-xs font-bold text-warning">
							<HugeiconsIcon icon={ChampionIcon} className="w-3 h-3" />
							Top 10%
						</div>
					</CardContent>
				</Card>
			</div>

			<section className="space-y-6">
				<h2 className="text-xl font-black uppercase tracking-tight">Learning Modules</h2>
				<div className="space-y-3">
					{lessons.length > 0 ? (
						lessons.map((lesson: any) => (
							<Link key={lesson.id} href={`/focus?lessonId=${lesson.id}`}>
								<Card className={cn(
									"group hover:border-primary/50 transition-all mb-3",
									lesson.completed ? "bg-muted/30" : "bg-card"
								)}>
									<CardContent className="p-5 flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className={cn(
												"w-10 h-10 rounded-xl flex items-center justify-center",
												lesson.completed ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
											)}>
												<HugeiconsIcon icon={lesson.completed ? BookOpen01Icon : PlayIcon} className="w-5 h-5" />
											</div>
											<div>
												<h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{lesson.title}</h3>
												<p className="text-[10px] font-black text-muted-foreground uppercase">{lesson.duration} min</p>
											</div>
										</div>
										{lesson.completed ? (
											<span className="text-[10px] font-black text-success uppercase tracking-widest">Completed</span>
										) : (
											<HugeiconsIcon icon={PlayIcon} className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
										)}
									</CardContent>
								</Card>
							</Link>
						))
					) : (
						<div className="py-12 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
							<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No modules found for this subject yet.</p>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
