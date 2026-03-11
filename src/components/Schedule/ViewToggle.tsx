'use client';

import type { ScheduleView } from '@/types/schedule';

interface ViewToggleProps {
	view: ScheduleView;
	onChange: (view: ScheduleView) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
	return (
		<div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
			<button
				type="button"
				onClick={() => onChange('active')}
				className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
					view === 'active'
						? 'bg-card text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				}`}
			>
				Focus
			</button>
			<button
				type="button"
				onClick={() => onChange('timeline')}
				className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
					view === 'timeline'
						? 'bg-card text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				}`}
			>
				Timeline
			</button>
		</div>
	);
}
