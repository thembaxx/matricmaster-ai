import { CalendarView } from '@/components/SmartScheduler/CalendarView';

export default function SmartSchedulerPage() {
	return (
		<div className="container max-w-7xl mx-auto px-4 py-6">
			<header className="mb-6">
				<h1 className="text-3xl font-display font-bold">Smart Scheduler</h1>
				<p className="text-muted-foreground mt-1">AI-powered study planning with exam countdown</p>
			</header>

			<CalendarView />
		</div>
	);
}
