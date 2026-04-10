'use client';

import {
	Building01Icon,
	CertificateIcon,
	LeftToRightListDashIcon,
	Target02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

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

interface PathfinderDashboardProps {
	subjects: SubjectGrade[];
	totalAPS: number;
	targetUniversity?: UniversityRequirement;
}

export function PathfinderDashboard({
	subjects,
	totalAPS,
	targetUniversity,
}: PathfinderDashboardProps) {
	const progressValue = targetUniversity
		? Math.min((totalAPS / targetUniversity.minAps) * 100, 100)
		: 0;

	const subjectAnalysis = useMemo(() => {
		return subjects
			.map((s) => {
				const isCore = ['Mathematics', 'Physical Sciences', 'English Home Language'].includes(
					s.subject
				);
				const potential = 7 - s.points;
				return {
					...s,
					isCore,
					potential,
					impact: isCore ? 'high' : 'medium',
				};
			})
			.sort((a, b) => b.potential - a.potential);
	}, [subjects]);

	return (
		<m.div variants={STAGGER_CONTAINER} initial="hidden" animate="visible" className="space-y-6">
			<Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-secondary/30">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl font-black lowercase flex items-center gap-2">
							<HugeiconsIcon icon={Target02Icon} className="w-6 h-6 text-primary" />
							university pathfinder
						</CardTitle>
						<Badge variant="outline" className="font-mono text-primary border-primary">
							current aps: {totalAPS}
						</Badge>
					</div>
					<CardDescription className="lowercase">
						strategic analysis based on your current performance and goals
					</CardDescription>
				</CardHeader>
				<CardContent>
					{targetUniversity ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between text-sm mb-1">
								<span className="font-bold lowercase">
									goal: {targetUniversity.name} ({targetUniversity.faculty})
								</span>
								<span className="font-mono font-bold text-primary">
									{totalAPS} / {targetUniversity.minAps}
								</span>
							</div>
							<Progress value={progressValue} className="h-3 rounded-full" />
							<p className="text-xs text-muted-foreground lowercase mt-2">
								{totalAPS < targetUniversity.minAps
									? `you need ${targetUniversity.minAps - totalAPS} more points to meet the minimum requirement.`
									: 'you currently meet the minimum requirements for this faculty!'}
							</p>
						</div>
					) : (
						<div className="p-8 border-2 border-dashed border-muted-foreground/20 rounded-2xl text-center">
							<HugeiconsIcon
								icon={Building01Icon}
								className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3"
							/>
							<p className="text-sm text-muted-foreground lowercase">
								select a university to begin deep analysis
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<m.div variants={STAGGER_ITEM}>
					<Card className="h-full">
						<CardHeader>
							<CardTitle className="text-sm font-bold lowercase flex items-center gap-2">
								<HugeiconsIcon icon={LeftToRightListDashIcon} className="w-4 h-4 text-orange-500" />
								quickest point gains
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{subjectAnalysis.slice(0, 3).map((s) => (
								<div
									key={s.subject}
									className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50"
								>
									<div>
										<p className="text-sm font-bold lowercase">{s.subject}</p>
										<p className="text-[10px] text-muted-foreground lowercase">
											current: level {s.points}
										</p>
									</div>
									<div className="text-right">
										<Badge
											className={cn(
												'text-[10px] lowercase text-white',
												s.impact === 'high' ? 'bg-orange-500' : 'bg-blue-500'
											)}
										>
											+{s.potential} pts potential
										</Badge>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</m.div>

				<m.div variants={STAGGER_ITEM}>
					<Card className="h-full bg-primary/5 border-primary/20">
						<CardHeader>
							<CardTitle className="text-sm font-bold lowercase flex items-center gap-2">
								<HugeiconsIcon icon={CertificateIcon} className="w-4 h-4 text-primary" />
								strategic advice
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								<li className="flex gap-3 text-xs lowercase">
									<div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
									<span>
										focus on <strong>core subjects</strong> like math and physics to unlock
										selective engineering faculties.
									</span>
								</li>
								<li className="flex gap-3 text-xs lowercase">
									<div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
									<span>
										your current best subjects are{' '}
										{subjects
											.filter((s) => s.points >= 6)
											.map((s) => s.subject)
											.join(', ') || 'none yet'}
										. keep maintaining these.
									</span>
								</li>
								{totalAPS < 30 && (
									<li className="flex gap-3 text-xs lowercase">
										<div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
										<span>
											urgent: aim for at least an APS of 30 to broaden your university degree
											options significantly.
										</span>
									</li>
								)}
							</ul>
						</CardContent>
					</Card>
				</m.div>
			</div>
		</m.div>
	);
}
