'use client';

import { m } from 'framer-motion';
import { ArrowRight, MapIcon, SparklesIcon, TargetIcon, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UniversityPathfinderDialog } from './UniversityPathfinderDialog';

interface UniversityPathfinderCardProps {
	universityName?: string;
	faculty?: string;
	currentAps?: number;
	targetAps?: number;
	completedMilestones?: number;
	totalMilestones?: number;
	potentialApsGain?: number;
	onGenerateRoadmap?: () => void;
}

export function UniversityPathfinderCard({
	universityName = 'No target set',
	faculty = '',
	currentAps = 0,
	targetAps = 42,
	completedMilestones = 0,
	totalMilestones = 0,
	potentialApsGain = 0,
}: UniversityPathfinderCardProps) {
	const [showDialog, setShowDialog] = useState(false);

	const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

	const apsGap = targetAps - currentAps;

	if (!universityName || universityName === 'No target set') {
		return (
			<m.div whileHover={{ y: -4 }} className="tiimo-card p-6 relative group overflow-hidden">
				<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-lavender/10 rounded-full blur-2xl" />

				<div className="flex items-start gap-4">
					<div className="p-3 bg-tiimo-lavender/10 rounded-xl">
						<MapIcon className="w-6 h-6 text-tiimo-lavender" />
					</div>

					<div className="flex-1">
						<h3 className="font-bold text-lg font-display">University Pathfinder</h3>
						<p className="text-sm text-muted-foreground mt-1">
							Set your university goal to get a personalized study roadmap
						</p>

						<Button
							onClick={() => setShowDialog(true)}
							className="mt-4 bg-tiimo-lavender hover:bg-tiimo-lavender/90"
						>
							<SparklesIcon className="w-4 h-4 mr-2" />
							Set Goal & Generate Roadmap
						</Button>
					</div>
				</div>

				<UniversityPathfinderDialog open={showDialog} onOpenChange={setShowDialog} />
			</m.div>
		);
	}

	return (
		<m.div whileHover={{ y: -4 }} className="tiimo-card p-6 relative group overflow-hidden">
			<div className="absolute -right-4 -top-4 w-24 h-24 bg-tiimo-lavender/10 rounded-full blur-2xl" />

			<div className="flex items-start justify-between">
				<div className="flex items-start gap-4">
					<div className="p-3 bg-tiimo-lavender/10 rounded-xl">
						<MapIcon className="w-6 h-6 text-tiimo-lavender" />
					</div>

					<div>
						<h3 className="font-bold text-lg font-display">University Pathfinder</h3>
						<p className="text-sm text-muted-foreground">
							{universityName} • {faculty}
						</p>
					</div>
				</div>

				<Button variant="ghost" size="sm" onClick={() => setShowDialog(true)}>
					View
					<ArrowRight className="w-4 h-4 ml-1" />
				</Button>
			</div>

			<div className="mt-6 space-y-4">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">APS Progress</span>
					<span className="font-bold">
						{currentAps} <span className="text-muted-foreground">/ {targetAps}</span>
					</span>
				</div>

				<Progress value={Math.min((currentAps / targetAps) * 100, 100)} className="h-2" />

				<p className="text-xs text-muted-foreground">
					{apsGap > 0
						? `${apsGap} more points needed to reach your goal`
						: "🎉 You've reached your APS target!"}
				</p>

				{totalMilestones > 0 && (
					<div className="pt-4 border-t">
						<div className="flex items-center justify-between text-sm mb-2">
							<span className="flex items-center gap-2">
								<TargetIcon className="w-4 h-4 text-tiimo-lavender" />
								Milestones
							</span>
							<span className="font-bold">
								{completedMilestones}/{totalMilestones}
							</span>
						</div>

						<Progress value={progress} className="h-1.5" />

						{potentialApsGain > 0 && (
							<p className="text-xs text-tiimo-green mt-2 flex items-center gap-1">
								<TrendingUp className="w-3 h-3" />
								Complete all milestones for +{potentialApsGain} APS potential
							</p>
						)}
					</div>
				)}
			</div>

			<UniversityPathfinderDialog
				open={showDialog}
				onOpenChange={setShowDialog}
				initialUniversity={universityName}
				initialFaculty={faculty}
			/>
		</m.div>
	);
}
