'use client';

import { Calendar02Icon, ClockIcon, Target02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { UserStats } from '@/hooks/useProfile';

interface StudyGoalPlannerProps {
	userStats?: UserStats | null;
}

interface SubjectTarget {
	id: string;
	name: string;
	targetScore: number;
	currentScore: number;
	color: string;
	bgColor: string;
}

const EXAM_DATE = new Date('2026-11-15');

const DEFAULT_SUBJECTS: SubjectTarget[] = [
	{
		id: 'math',
		name: 'Mathematics',
		targetScore: 70,
		currentScore: 65,
		color: 'text-primary-violet',
		bgColor: 'bg-primary-violet',
	},
	{
		id: 'phy_sci',
		name: 'Physical Sciences',
		targetScore: 75,
		currentScore: 70,
		color: 'text-accent-lime',
		bgColor: 'bg-accent-lime',
	},
	{
		id: 'life_sci',
		name: 'Life Sciences',
		targetScore: 80,
		currentScore: 75,
		color: 'text-primary-orange',
		bgColor: 'bg-primary-orange',
	},
	{
		id: 'eng_fal',
		name: 'English FAL',
		targetScore: 70,
		currentScore: 68,
		color: 'text-primary-cyan',
		bgColor: 'bg-primary-cyan',
	},
	{
		id: 'geo',
		name: 'Geography',
		targetScore: 75,
		currentScore: 72,
		color: 'text-accent-pink',
		bgColor: 'bg-accent-pink',
	},
];

function calculateTimeRemaining(): {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
} {
	const now = new Date();
	const diff = EXAM_DATE.getTime() - now.getTime();

	if (diff <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0 };
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return { days, hours, minutes, seconds };
}

export default function StudyGoalPlanner(props: StudyGoalPlannerProps) {
	void props;
	const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());
	const [subjectTargets, setSubjectTargets] = useState<SubjectTarget[]>(DEFAULT_SUBJECTS);
	const [weeklyHours, setWeeklyHours] = useState(20);
	const hoursLogged = 12;
	const [isEditingHours, setIsEditingHours] = useState(false);
	const [tempHours, setTempHours] = useState('20');

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeRemaining(calculateTimeRemaining());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const handleSubjectTargetChange = (id: string, value: string) => {
		const numValue = Math.min(100, Math.max(0, Number.parseInt(value, 10) || 0));
		setSubjectTargets((prev) =>
			prev.map((subj) => (subj.id === id ? { ...subj, targetScore: numValue } : subj))
		);
	};

	const handleSaveWeeklyHours = () => {
		const hours = Math.min(168, Math.max(0, Number.parseInt(tempHours, 10) || 0));
		setWeeklyHours(hours);
		setIsEditingHours(false);
	};

	const handleHoursKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSaveWeeklyHours();
		} else if (e.key === 'Escape') {
			setIsEditingHours(false);
			setTempHours(weeklyHours.toString());
		}
	};

	return (
		<Card className="p-6 sm:p-8 rounded-[2rem] border-2 border-border/50 bg-card/50 backdrop-blur-sm">
			<div className="flex items-center gap-3 mb-8">
				<div className="w-12 h-12 rounded-2xl bg-primary-violet/10 flex items-center justify-center">
					<HugeiconsIcon icon={Target02Icon} className="w-6 h-6 text-primary-violet" />
				</div>
				<h3 className="text-xl font-black text-foreground tracking-tighter">study goal planner</h3>
			</div>

			{/* Exam Countdown */}
			<div className="mb-10">
				<div className="flex items-center gap-2 mb-4">
					<HugeiconsIcon icon={Calendar02Icon} className="w-4 h-4 text-label-tertiary" />
					<p className="label-xs font-black text-label-tertiary tracking-tight">
						nsc exam countdown
					</p>
				</div>
				<div className="flex flex-wrap gap-4">
					<m.div
						key={`days-${timeRemaining.days}`}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="flex-1 min-w-[80px] p-4 rounded-2xl bg-primary-violet/5 border border-primary-violet/20"
					>
						<p className="label-xs font-black text-label-tertiary tracking-tight mb-1">days</p>
						<p className="text-4xl font-black text-primary-violet tracking-tighter font-numeric">
							{timeRemaining.days}
						</p>
					</m.div>
					<m.div
						key={`hours-${timeRemaining.hours}`}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="flex-1 min-w-[80px] p-4 rounded-2xl bg-accent-lime/5 border border-accent-lime/20"
					>
						<p className="label-xs font-black text-label-tertiary tracking-tight mb-1">hours</p>
						<p className="text-4xl font-black text-accent-lime tracking-tighter font-numeric">
							{String(timeRemaining.hours).padStart(2, '0')}
						</p>
					</m.div>
					<m.div
						key={`mins-${timeRemaining.minutes}`}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="flex-1 min-w-[80px] p-4 rounded-2xl bg-primary-orange/5 border border-primary-orange/20"
					>
						<p className="label-xs font-black text-label-tertiary tracking-tight mb-1">mins</p>
						<p className="text-4xl font-black text-primary-orange tracking-tighter font-numeric">
							{String(timeRemaining.minutes).padStart(2, '0')}
						</p>
					</m.div>
					<m.div
						key={`secs-${timeRemaining.seconds}`}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="flex-1 min-w-[80px] p-4 rounded-2xl bg-primary-cyan/5 border border-primary-cyan/20"
					>
						<p className="label-xs font-black text-label-tertiary tracking-tight mb-1">secs</p>
						<p className="text-4xl font-black text-primary-cyan tracking-tighter font-numeric">
							{String(timeRemaining.seconds).padStart(2, '0')}
						</p>
					</m.div>
				</div>
			</div>

			{/* Weekly Study Hours */}
			<div className="mb-10">
				<div className="flex items-center gap-2 mb-4">
					<HugeiconsIcon icon={ClockIcon} className="w-4 h-4 text-label-tertiary" />
					<p className="label-xs font-black text-label-tertiary tracking-tight">
						weekly study hours
					</p>
				</div>
				<div className="flex flex-col sm:flex-row sm:items-center gap-4">
					<div className="flex-1 flex items-center gap-3">
						{isEditingHours ? (
							<Input
								type="number"
								value={tempHours}
								onChange={(e) => setTempHours(e.target.value)}
								onKeyDown={handleHoursKeyDown}
								onBlur={handleSaveWeeklyHours}
								className="w-24 h-12 text-xl font-black"
								autoFocus
								min={0}
								max={168}
							/>
						) : (
							<>
								<p className="text-4xl font-black text-foreground tracking-tighter font-numeric">
									{weeklyHours}
								</p>
								<span className="body-sm text-muted-foreground">hours/week</span>
							</>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							if (isEditingHours) {
								handleSaveWeeklyHours();
							} else {
								setTempHours(weeklyHours.toString());
								setIsEditingHours(true);
							}
						}}
						className="w-fit"
					>
						{isEditingHours ? 'save' : 'edit'}
					</Button>
				</div>
				{/* Progress bar for weekly hours */}
				<div className="mt-4">
					<div className="flex justify-between label-xs text-muted-foreground mb-2">
						<span className="font-numeric">{hoursLogged} hours logged</span>
						<span className="font-numeric">{Math.round((hoursLogged / weeklyHours) * 100)}%</span>
					</div>
					<div className="h-3 rounded-full bg-muted overflow-hidden">
						<m.div
							initial={{ width: 0 }}
							animate={{ width: `${Math.min(100, (hoursLogged / weeklyHours) * 100)}%` }}
							transition={{ duration: 1, ease: 'easeOut' }}
							className="h-full rounded-full bg-gradient-to-r from-primary-violet to-accent-lime"
						/>
					</div>
				</div>
			</div>

			{/* Target Scores */}
			<div>
				<div className="flex items-center gap-2 mb-6">
					<HugeiconsIcon icon={Target02Icon} className="w-4 h-4 text-label-tertiary" />
					<p className="label-xs font-black text-label-tertiary tracking-tight">target scores</p>
				</div>
				<div className="space-y-4">
					{subjectTargets.map((subject) => {
						const progress = Math.min(100, (subject.currentScore / subject.targetScore) * 100);
						return (
							<div key={subject.id} className="p-4 rounded-2xl bg-muted/30 border border-border/30">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
									<span className="body-sm font-medium text-foreground">
										{subject.name.toLowerCase()}
									</span>
									<div className="flex items-center gap-2">
										<input
											type="number"
											min={0}
											max={100}
											value={subject.targetScore}
											onChange={(e) => handleSubjectTargetChange(subject.id, e.target.value)}
											className="w-16 h-8 rounded-lg border border-input bg-background px-2 text-center text-sm font-black font-numeric"
										/>
										<span className="label-xs text-muted-foreground">target</span>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
										<m.div
											initial={{ width: 0 }}
											animate={{ width: `${progress}%` }}
											transition={{ duration: 0.8, ease: 'easeOut' }}
											className={`h-full rounded-full ${subject.bgColor}`}
										/>
									</div>
									<span
										className={`body-sm font-black ${subject.color} min-w-[60px] text-right font-numeric`}
									>
										{subject.currentScore}%
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</Card>
	);
}
