import { formatTime } from './hooks';

interface BlockEvent {
	id: string;
	title: string;
	startTime: Date;
	endTime: Date;
	eventType: string;
	subjectId?: number;
	subjectName?: string;
	isCompleted: boolean;
}

interface BlockActionHeaderProps {
	event: BlockEvent | null;
	getSubjectName: (subjectId?: number) => string;
	className?: string;
	titleClassName?: string;
	descriptionClassName?: string;
}

function CompletedBadge() {
	return (
		<span className="shrink-0">
			<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 text-green-600 text-xs font-bold">
				<svg
					aria-label="Completed"
					className="w-3.5 h-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<title>Completed</title>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
				</svg>
				DONE
			</span>
		</span>
	);
}

export function BlockActionHeader({
	event,
	getSubjectName,
	className,
	titleClassName,
	descriptionClassName,
}: BlockActionHeaderProps) {
	return (
		<div className={className}>
			<h2 className={`text-2xl font-bold flex items-center gap-3 ${titleClassName || ''}`}>
				<span className="truncate">{event?.title}</span>
				{event?.isCompleted && <CompletedBadge />}
			</h2>
			<p className={`text-sm mt-1.5 ${descriptionClassName || ''}`}>
				<span className="font-medium">
					{event?.subjectId ? getSubjectName(event.subjectId) : 'No subject linked'}
				</span>
				{event && (
					<span className="text-muted-foreground/70 ml-2">
						• {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
					</span>
				)}
			</p>
		</div>
	);
}
