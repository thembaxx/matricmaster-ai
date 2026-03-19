'use client';

import {
	Calendar01Icon,
	ChampionIcon,
	CheckmarkCircle02Icon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createStudyPlanAction, getStudyPlansAction } from '@/lib/db/actions';
import type { StudyPlan } from '@/lib/db/schema';
import { DAY_LABELS, EXAM_DATE } from './constants';
import { PriorityList } from './PriorityList';

export default function PlannerPage() {
	const [daysLeft, setDaysLeft] = useState(0);
	const [plans, setPlans] = useState<StudyPlan[]>([]);
	const [isAdding, setIsAdding] = useState(false);
	const [newTitle, setNewTitle] = useState('');

	useEffect(() => {
		const today = new Date();
		const diff = EXAM_DATE.getTime() - today.getTime();
		setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));

		async function loadPlans() {
			const data = await getStudyPlansAction();
			setPlans(data);
		}
		loadPlans();
	}, []);

	const handleAddPlan = async () => {
		if (!newTitle.trim()) return;
		const result = await createStudyPlanAction({ title: newTitle });
		if (result.success && result.plan) {
			setPlans([...plans, result.plan]);
			setNewTitle('');
			setIsAdding(false);
			toast.success('Task added to priority focus');
		} else {
			toast.error('Failed to add task');
		}
	};

	return (
		<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
			{/* ... previous header ... */}
			<div className="mb-8">
				<h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
					Study Planner
				</h1>
				<p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">
					Plan your NSC exam prep
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Countdown Card */}
				{/* ... same as before ... */}
				<Card className="md:col-span-2 overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 to-transparent shadow-tiimo">
					<CardContent className="p-8 flex items-center justify-between">
						<div className="space-y-2">
							<h2 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
								Final Exams Countdown
							</h2>
							<div className="flex items-baseline gap-2">
								<span className="text-7xl font-black tracking-tighter text-foreground">
									{daysLeft}
								</span>
								<span className="text-xl font-bold text-muted-foreground uppercase">
									Days to go
								</span>
							</div>
							<Progress value={65} className="h-2 w-full mt-4" />
						</div>
						<div className="hidden sm:flex w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
							<HugeiconsIcon icon={Calendar01Icon} className="w-10 h-10 text-primary" />
						</div>
					</CardContent>
				</Card>

				{/* Quick Stats */}
				{/* ... same ... */}
				<div className="space-y-4">
					<Card className="shadow-tiimo border-border/50">
						<CardContent className="p-6 flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
								<HugeiconsIcon icon={Target01Icon} className="w-6 h-6 text-success" />
							</div>
							<div>
								<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
									Weekly Goal
								</p>
								<p className="text-xl font-black">12/20 Hours</p>
							</div>
						</CardContent>
					</Card>
					<Card className="shadow-tiimo border-border/50">
						<CardContent className="p-6 flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
								<HugeiconsIcon icon={ChampionIcon} className="w-6 h-6 text-warning" />
							</div>
							<div>
								<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
									Mastery Level
								</p>
								<p className="text-xl font-black">Grade 12 Senior</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<PriorityList
					plans={plans}
					isAdding={isAdding}
					newTitle={newTitle}
					onTitleChange={setNewTitle}
					onAdd={handleAddPlan}
					onStartAdding={() => setIsAdding(true)}
				/>

				{/* Daily Habit Tracker */}
				{/* ... same ... */}
				<Card className="shadow-tiimo border-border/50">
					<CardHeader>
						<CardTitle className="text-lg font-black uppercase tracking-tight">
							Consistency
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-7 gap-2">
							{DAY_LABELS.map((day, i) => (
								<div key={i} className="flex flex-col items-center gap-2">
									<span className="text-[10px] font-black text-muted-foreground">{day}</span>
									<div
										className={`w-8 h-8 rounded-lg flex items-center justify-center ${
											i < 4 ? 'bg-success text-white' : 'bg-muted border border-border'
										}`}
									>
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
