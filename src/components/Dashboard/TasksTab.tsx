import { motion as m } from 'motion/react';
import { FocusAreasWidget } from '@/components/Dashboard/FocusAreasWidget';
import { type StudyTask, TaskCard } from '@/components/Dashboard/TaskCardV2';
import { TaskSection } from '@/components/Dashboard/TaskSectionV2';
import { MistakeBank } from '@/components/Widgets/MistakeBank';

interface TasksTabProps {
	tasks: Record<string, StudyTask[]>;
	expanded: Record<string, boolean>;
	onToggleTask: (taskId: string, priority: string) => void;
	onToggleSection: (priority: string) => void;
	mistakeCount: number;
}

export function TasksTab({
	tasks,
	expanded,
	onToggleTask,
	onToggleSection,
	mistakeCount,
}: TasksTabProps) {
	return (
		<m.div layout className="space-y-6 pb-36">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<MistakeBank initialCount={mistakeCount} />
				<FocusAreasWidget />
			</div>
			<div className="space-y-6">
				<TaskSection
					title="High Priority"
					priority="high"
					expanded={expanded.high}
					onToggle={() => onToggleSection('high')}
				>
					{tasks.high.map((task, index) => (
						<TaskCard
							key={task.id}
							task={task}
							index={index}
							onToggle={() => onToggleTask(task.id, 'high')}
						/>
					))}
				</TaskSection>
				<TaskSection
					title="Quick Tasks"
					priority="medium"
					expanded={expanded.medium}
					onToggle={() => onToggleSection('medium')}
				>
					{tasks.medium.map((task, index) => (
						<TaskCard
							key={task.id}
							task={task}
							index={index}
							onToggle={() => onToggleTask(task.id, 'medium')}
						/>
					))}
				</TaskSection>
			</div>
		</m.div>
	);
}
