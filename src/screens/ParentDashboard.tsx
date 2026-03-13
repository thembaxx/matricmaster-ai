'use client';

import {
	ArrowLeft01Icon,
	ChartBar,
	Clock01Icon,
	Download01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ParentDashboardProps {
	userName?: string;
}

const MOCK_DATA = {
	totalHoursStudied: 12.5,
	weeklyChange: 2.5,
	averageScore: 78,
	subjects: [
		{ subj: 'Mathematics', score: 82, status: 'Excellent', color: 'text-success' },
		{ subj: 'Physical Sciences', score: 65, status: 'Needs Work', color: 'text-warning' },
		{ subj: 'English FAL', score: 91, status: 'Outstanding', color: 'text-success' },
		{ subj: 'Life Sciences', score: 74, status: 'Good', color: 'text-success' },
	],
};

export default function ParentDashboard({ userName = 'Student' }: ParentDashboardProps) {
	const router = useRouter();

	const { totalHoursStudied, weeklyChange, averageScore, subjects } = MOCK_DATA;

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-black uppercase tracking-tight">Parent / Tutor Portal</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 pb-32 max-w-4xl mx-auto w-full space-y-8">
					<Card className="rounded-[3rem] border border-border/50 shadow-tiimo overflow-hidden">
						<div className="p-8 bg-linear-to-br from-primary/10 to-transparent flex items-center gap-6">
							<div className="w-20 h-20 rounded-[2rem] bg-card flex items-center justify-center shadow-lg border-2 border-white">
								<HugeiconsIcon icon={UserIcon} className="w-10 h-10 text-primary" />
							</div>
							<div>
								<h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">
									{userName}'s Progress
								</h2>
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
									Matric Class of 2026
								</p>
							</div>
							<Button className="ml-auto rounded-full gap-2 font-black uppercase text-[10px]">
								<HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
								Weekly Report
							</Button>
						</div>
					</Card>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<Card className="p-8 rounded-[2.5rem] border border-border/50 shadow-tiimo bg-card">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
									<HugeiconsIcon icon={Clock01Icon} className="w-6 h-6" />
								</div>
								<div>
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										Time Studied
									</p>
									<p className="text-2xl font-black text-foreground">{totalHoursStudied} Hours</p>
								</div>
							</div>
							<Progress value={(totalHoursStudied / 20) * 100} className="h-2" />
							<p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase text-center tracking-widest">
								+{weeklyChange}h from last week
							</p>
						</Card>

						<Card className="p-8 rounded-[2.5rem] border border-border/50 shadow-tiimo bg-card">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
									<HugeiconsIcon icon={ChartBar} className="w-6 h-6" />
								</div>
								<div>
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										Average Score
									</p>
									<p className="text-2xl font-black text-foreground">{averageScore}% Mastery</p>
								</div>
							</div>
							<Progress value={averageScore} className="h-2" />
							<p className="text-[10px] font-bold text-success mt-4 uppercase text-center tracking-widest">
								{averageScore >= 70 ? 'Master level achieved' : 'Keep practicing!'}
							</p>
						</Card>
					</div>

					<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
						<CardHeader className="bg-muted/30 px-8 py-6">
							<CardTitle className="text-lg font-black uppercase tracking-tight">
								Subject Performance
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<div className="divide-y divide-border/50">
								{subjects.map((item, i) => (
									<div
										key={i}
										className="px-8 py-5 flex items-center justify-between hover:bg-muted/20 transition-colors"
									>
										<span className="font-bold text-sm uppercase tracking-tight">{item.subj}</span>
										<div className="flex items-center gap-8">
											<span className="font-black text-lg">{item.score}%</span>
											<span
												className={cn(
													'text-[10px] font-black uppercase tracking-widest w-24 text-right',
													item.color
												)}
											>
												{item.status}
											</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</main>
			</ScrollArea>
		</div>
	);
}
