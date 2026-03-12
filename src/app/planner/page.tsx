'use client';

import {
	Calendar01Icon,
	Clock01Icon,
	Flag01Icon,
	Target01Icon,
	Trophy01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PlannerPage() {
	const [daysLeft, setDaysLeft] = useState(0);

	useEffect(() => {
		const examDate = new Date('2026-10-20');
		const today = new Date();
		const diff = examDate.getTime() - today.getTime();
		setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
	}, []);

	return (
		<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
			<div className="mb-8">
				<h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Study Planner</h1>
				<p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">
					Optimize your exam preparation
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Countdown Card */}
				<Card className="md:col-span-2 overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 to-transparent shadow-tiimo">
					<CardContent className="p-8 flex items-center justify-between">
						<div className="space-y-2">
							<h2 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Final Exams Countdown</h2>
							<div className="flex items-baseline gap-2">
								<span className="text-7xl font-black tracking-tighter text-foreground">{daysLeft}</span>
								<span className="text-xl font-bold text-muted-foreground uppercase">Days to go</span>
							</div>
							<Progress value={65} className="h-2 w-full mt-4" />
						</div>
						<div className="hidden sm:flex w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
							<HugeiconsIcon icon={Calendar01Icon} className="w-10 h-10 text-primary" />
						</div>
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<div className="space-y-4">
					<Card className="shadow-tiimo border-border/50">
						<CardContent className="p-6 flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
								<HugeiconsIcon icon={Target01Icon} className="w-6 h-6 text-success" />
							</div>
							<div>
								<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Weekly Goal</p>
								<p className="text-xl font-black">12/20 Hours</p>
							</div>
						</CardContent>
					</Card>
					<Card className="shadow-tiimo border-border/50">
						<CardContent className="p-6 flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
								<HugeiconsIcon icon={Trophy01Icon} className="w-6 h-6 text-warning" />
							</div>
							<div>
								<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Mastery Level</p>
								<p className="text-xl font-black">Grade 12 Senior</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Priority List (Big Rocks) */}
				<Card className="md:col-span-2 shadow-tiimo border-border/50">
					<CardHeader>
						<CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
							<HugeiconsIcon icon={Flag01Icon} className="w-5 h-5 text-destructive" />
							Priority Focus (Big Rocks)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{[
								{ task: 'Master Calculus Optimization', subject: 'Maths', priority: 'High' },
								{ task: 'Review Momentum & Impulse', subject: 'Physics', priority: 'High' },
								{ task: 'DNA Replication Diagrams', subject: 'Life Sci', priority: 'Medium' },
							].map((item, i) => (
								<div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
									<div className="flex items-center gap-4">
										<div className="w-2 h-2 rounded-full bg-primary" />
										<div>
											<p className="font-bold text-sm">{item.task}</p>
											<p className="text-[10px] font-black text-muted-foreground uppercase">{item.subject}</p>
										</div>
									</div>
									<span className={`text-[10px] font-black px-2 py-1 rounded-full ${
										item.priority === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-foreground'
									}`}>
										{item.priority}
									</span>
								</div>
							))}
						</div>
						<Button variant="ghost" className="w-full mt-4 font-black uppercase text-[10px] tracking-widest">
							Add Priority Task
						</Button>
					</CardContent>
				</Card>

				{/* Daily Habit Tracker */}
				<Card className="shadow-tiimo border-border/50">
					<CardHeader>
						<CardTitle className="text-lg font-black uppercase tracking-tight">Consistency</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-7 gap-2">
							{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
								<div key={i} className="flex flex-col items-center gap-2">
									<span className="text-[10px] font-black text-muted-foreground">{day}</span>
									<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
										i < 4 ? 'bg-success text-white' : 'bg-muted border border-border'
									}`}>
										{i < 4 && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />}
									</div>
								</div>
							))}
						</div>
						<p className="text-xs font-medium text-muted-foreground mt-6 text-center">
							You've studied 4 days in a row!
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
