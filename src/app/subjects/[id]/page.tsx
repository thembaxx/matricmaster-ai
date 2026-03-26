'use client';

import {
	ArrowLeft01Icon,
	BookOpen01Icon,
	ChampionIcon,
	PlayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getSubjectFont, getSubjectName } from '@/lib/content-adapter';
import { getLessonsBySubject } from '@/lib/lessons';
import { cn } from '@/lib/utils';

export default function SubjectDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const subjectId = params.id as string;
	const lessons = getLessonsBySubject(subjectId);
	const subjectName = getSubjectName(subjectId);
	const subjectFont = getSubjectFont(subjectId);

	const completedCount = lessons.filter((l) => l.completed).length;
	const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

	return (
		<div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="max-w-4xl mx-auto space-y-8"
			>
				<button
					type="button"
					onClick={() => router.back()}
					className="flex items-center gap-2 text-tiimo-gray-muted hover:text-foreground transition-colors group"
				>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						className="w-5 h-5 transition-transform group-hover:-translate-x-1"
					/>
					<span className="font-black  tracking-widest text-[10px]">Back</span>
				</button>

				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-card rounded-[2.5rem] p-8 shadow-tiimo border border-border/50">
					<div className="space-y-4">
						<div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
							<HugeiconsIcon icon={BookOpen01Icon} className="w-8 h-8" />
						</div>
						<div>
							<h1
								className="text-4xl font-black  tracking-tighter mb-1"
								style={{ fontFamily: subjectFont }}
							>
								{subjectName}
							</h1>
							<p className="text-tiimo-gray-muted font-bold  tracking-[0.2em] text-[10px]">
								NSC CURRICULUM • GRADE 12
							</p>
						</div>
					</div>

					<div className="w-full sm:w-64 space-y-3">
						<div className="flex justify-between items-end">
							<span className="text-[10px] font-black  tracking-widest text-tiimo-gray-muted">
								Overall Progress
							</span>
							<span className="text-sm font-black text-primary">{Math.round(progress)}%</span>
						</div>
						<Progress value={progress} className="h-3 rounded-full bg-secondary" />
					</div>
				</div>

				<div className="grid gap-4">
					<h2 className="text-xs font-black  tracking-[0.2em] text-tiimo-gray-muted ml-4">
						Learning Path
					</h2>
					{lessons.map((lesson, index) => (
						<m.div
							key={lesson.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Link href={`/focus?lessonId=${lesson.id}&subject=${subjectId}`}>
								<Card
									className={cn(
										'group rounded-[2rem] border-border/50 shadow-tiimo transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden',
										lesson.completed ? 'bg-secondary/30' : 'bg-card'
									)}
								>
									<CardContent className="p-0">
										<div className="flex items-center gap-6 p-6">
											<div
												className={cn(
													'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
													lesson.completed
														? 'bg-tiimo-green text-white'
														: 'bg-secondary text-tiimo-gray-muted group-hover:bg-primary group-hover:text-white'
												)}
											>
												<HugeiconsIcon
													icon={lesson.completed ? ChampionIcon : PlayIcon}
													className="w-6 h-6"
												/>
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="text-lg font-black  tracking-tight truncate">
													{lesson.title}
												</h3>
												<p className="text-[10px] font-bold text-tiimo-gray-muted  tracking-widest mt-0.5">
													{lesson.topic} • 15-20 MINS
												</p>
											</div>
											{lesson.completed && (
												<div className="hidden sm:block px-4 py-2 rounded-full bg-tiimo-green/10 text-tiimo-green text-[10px] font-black  tracking-widest">
													Mastered
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</Link>
						</m.div>
					))}
				</div>
			</m.div>
		</div>
	);
}
