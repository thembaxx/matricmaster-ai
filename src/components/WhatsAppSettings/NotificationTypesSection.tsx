import { Switch } from '@/components/ui/switch';

const NOTIFICATION_TYPES = [
	{
		id: 'study_reminder',
		label: 'Study Reminders',
		icon: '🔔',
		description: 'Get reminded to study',
	},
	{
		id: 'achievement_share',
		label: 'Achievements',
		icon: '🏆',
		description: 'Share your achievements',
	},
	{
		id: 'buddy_update',
		label: 'Buddy Updates',
		icon: '👥',
		description: 'Know when friends beat your score',
	},
	{ id: 'daily_tip', label: 'Daily Tips', icon: '💡', description: 'Study tips and motivation' },
];

interface NotificationTypesSectionProps {
	enabledTypes: string[];
	onToggle: (typeId: string, enabled: boolean) => void;
}

export function NotificationTypesSection({
	enabledTypes,
	onToggle,
}: NotificationTypesSectionProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-medium">Notification Types</h3>
			<div className="space-y-3">
				{NOTIFICATION_TYPES.map((type) => (
					<div key={type.id} className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<span>{type.icon}</span>
							<div>
								<p className="font-medium text-sm">{type.label}</p>
								<p className="text-xs text-muted-foreground">{type.description}</p>
							</div>
						</div>
						<Switch
							checked={enabledTypes.includes(type.id)}
							onCheckedChange={(checked) => onToggle(type.id, checked)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
