'use client';

import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { JourneyStepCard } from '@/components/StudyPath/JourneyStepCard';
import { SchedulePathModal } from '@/components/StudyPath/SchedulePathModal';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import studyPathsData from '@/content/study-paths.json';
import type { PathScheduleResult, StudyStep } from '@/services/studyPathSchedulerService';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';

interface JourneyStep {
	id: string;
	emoji: string;
	title: string;
	description: string;
	duration: string;
	status: 'completed' | 'current' | 'locked';
	progress?: number;
	type: 'lesson' | 'practice' | 'quiz';
	durationMinutes: number;
}

export default function StudyPathView() {
	const router = useRouter();
	const pathData =
		studyPathsData.studyPaths.find((p) => p.id === 'math-p1-mastery') ||
		studyPathsData.studyPaths[0];
	const [activeModuleIndex, setActiveModuleIndex] = useState(0);
	const [expandedStep, setExpandedStep] = useState<string | null>(null);
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const { saveImportedBlocks } = useSmartSchedulerStore();

	const module = pathData.modules[activeModuleIndex];
	const steps: JourneyStep[] = module.steps.map((step, idx) => ({
		id: `${module.id}-${idx}`,
		emoji: step.type === 'lesson' ? '📖' : step.type === 'quiz' ? '✅' : '✍️',
		title: step.title,
		description: step.type === 'lesson' ? 'learn core concepts' : 'apply your knowledge',
		duration: `${step.duration} min`,
		durationMinutes: step.duration,
		status: idx === 0 ? 'current' : 'locked',
		type: step.type as 'lesson' | 'practice' | 'quiz',
	}));

	const allSteps: StudyStep[] = pathData.modules.flatMap((mod) =>
		mod.steps.map((step, idx) => ({
			id: `${mod.id}-${idx}`,
			title: step.title,
			type: step.type as StudyStep['type'],
			durationMinutes: step.duration,
			topic: step.title,
			subject: pathData.title,
		}))
	);

	const handleScheduleGenerated = async (result: PathScheduleResult) => {
		await saveImportedBlocks(result.blocks);
		toast.success(`${result.blocks.length} blocks added to your schedule!`);
	};

	const toggleStep = (stepId: string) => {
		setExpandedStep(expandedStep === stepId ? null : stepId);
	};

	const completedSteps = steps.filter((s) => s.status === 'completed').length;
	const totalSteps = steps.length;
	const progressPercent = (completedSteps / totalSteps) * 100;

	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<span className="text-3xl">{pathData.icon}</span>
					<div>
						<h2 className="text-xl font-display font-bold">{pathData.title}</h2>
						<p className="text-xs text-muted-foreground">{module.title}</p>
					</div>
				</div>

				<div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
					{pathData.modules.map((m, idx) => (
						<Button
							key={m.id}
							variant={activeModuleIndex === idx ? 'default' : 'outline'}
							size="sm"
							className="rounded-full whitespace-nowrap"
							onClick={() => setActiveModuleIndex(idx)}
						>
							module {idx + 1}
						</Button>
					))}
				</div>

				<div className="bg-card rounded-2xl p-4 border border-border">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-medium">module progress</span>
						<span className="text-xs font-bold text-primary">{Math.round(progressPercent)}%</span>
					</div>
					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<m.div
							className="h-full bg-primary rounded-full"
							initial={{ width: 0 }}
							animate={{ width: `${progressPercent}%` }}
							transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
						/>
					</div>
				</div>
			</div>

			<ScrollArea className="h-[500px] pr-4">
				<div className="space-y-4">
					{steps.map((step, index) => (
						<JourneyStepCard
							key={step.id}
							step={step}
							index={index}
							isExpanded={expandedStep === step.id}
							onToggle={() => toggleStep(step.id)}
							onNavigate={(path) => router.push(path)}
						/>
					))}
				</div>
			</ScrollArea>

			<div className="space-y-3">
				<Button
					size="lg"
					className="w-full rounded-2xl h-14 text-lg"
					onClick={() => router.push('/focus')}
				>
					{steps.find((s) => s.status === 'current') ? 'continue learning →' : 'start journey →'}
				</Button>
				<Button
					size="lg"
					variant="outline"
					className="w-full rounded-2xl h-12 text-base"
					onClick={() => setShowScheduleModal(true)}
				>
					📅 schedule my path
				</Button>
			</div>

			<SchedulePathModal
				open={showScheduleModal}
				onOpenChange={setShowScheduleModal}
				steps={allSteps}
				pathTitle={pathData.title}
				onScheduleGenerated={handleScheduleGenerated}
			/>
		</div>
	);
}
